import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../../../../../shared/interface/order.interface';
import { FormControl, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { SettingState } from '../../../../../shared/state/setting.state';
import { Values } from '../../../../../shared/interface/setting.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { OrderService } from '../../../../../shared/services/order.service';
import { CartService } from '../../../../../shared/services/cart.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { v4 as uuidv4 } from 'uuid';

// Gateways that have their own initiation endpoint — bypasses /rePayment
const DIRECT_GATEWAY_METHODS = ['cash_free', 'zyaada_pay', 'suraj_airpay'];

@Component({
  selector: 'app-pay-modal',
  templateUrl: './pay-modal.component.html',
  styleUrls: ['./pay-modal.component.scss']
})
export class PayModalComponent {

  @ViewChild("payModal", { static: false }) PayModal: TemplateRef<string>;
  @Select(SettingState.setting) setting$: Observable<Values>;

  public modalOpen: boolean = false;
  public order: Order;
  public paymentType = new FormControl('', [Validators.required]);
  public paymentUrl: SafeResourceUrl | null = null;

  constructor(
    private modalService: NgbModal,
    private store: Store,
    private router: Router,
    private sanitizer: DomSanitizer,
    private orderService: OrderService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  async openModal(order: Order) {
    this.order = order;
    this.paymentUrl = null;
    this.paymentType.reset();
    this.modalOpen = true;
    this.modalService.open(this.PayModal, {
      ariaLabelledBy: 'profile-Modal',
      centered: true,
      windowClass: 'theme-modal pay-modal',
      size: 'lg'
    }).result.then(() => {
      this.onModalClosed();
    }, () => {
      this.onModalClosed();
    });
  }

  private onModalClosed() {
    if (this.paymentUrl) {
      const isGuest = !this.store.selectSnapshot((state: any) => state.auth?.access_token);
      if (isGuest) {
        this.router.navigate(['/order/details'], {
          queryParams: { order_number: this.order.order_number, email_or_phone: this.order.guest_order?.email }
        });
      } else {
        this.router.navigateByUrl(`/account/order/details/${this.order.order_number}`);
      }
    }
  }

  submit() {
    this.paymentType.markAllAsTouched();
    if (!this.paymentType.valid) return;

    const paymentMethod = this.paymentType.value!;

    if (DIRECT_GATEWAY_METHODS.includes(paymentMethod)) {
      this.submitDirectGateway(paymentMethod);
    } else {
      this.submitRePayment(paymentMethod);
    }
  }

  private buildGatewayPayload(): object {
    const consumer = this.order.consumer || this.order.guest_order;
    return {
      uuid: uuidv4(),
      email: consumer?.email,
      total: this.order.total,
      phone: consumer?.phone,
      name: consumer?.name || this.order.consumer_name,
      address: `${this.order.billing_address?.city || ''} ${this.order.billing_address?.area || ''}`.trim()
    };
  }

  private submitDirectGateway(paymentMethod: string) {
    const payload = this.buildGatewayPayload();

    const intent$: Observable<any> =
      paymentMethod === 'cash_free'    ? this.cartService.initiateCashFreeIntent(payload) :
      paymentMethod === 'zyaada_pay'   ? this.cartService.initiateZyaadaPayIntent(payload) :
      /* suraj_airpay */                 this.cartService.initiateAirpayIntent(payload);

    intent$.subscribe({
      next: (response: any) => {
        const url = response?.data?.payment_url || response?.data?.payment_link;
        if (url) {
          this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        } else {
          this.notificationService.showError(response?.msg || 'Failed to initiate payment.');
        }
      },
      error: (err: any) => {
        this.notificationService.showError(err?.error?.message || 'Payment failed. Please try again.');
      }
    });
  }

  private submitRePayment(paymentMethod: string) {
    this.orderService.rePayment({ order_number: this.order.order_number, payment_method: paymentMethod }).subscribe({
      next: (result: any) => {
        const url = result?.url || result?.payment_url || result?.data?.payment_url;
        if (url) {
          this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        } else {
          // COD / bank transfer — navigate directly without iframe
          this.paymentUrl = null;
          this.modalService.dismissAll();
          if (result?.is_guest) {
            this.router.navigate(['/order/details'], {
              queryParams: { order_number: result.order_number, email_or_phone: result.email }
            });
          } else {
            this.router.navigateByUrl(`/account/order/details/${result.order_number}`);
          }
        }
      },
      error: (err: any) => {
        this.notificationService.showError(err?.error?.message || 'Payment failed. Please try again.');
      }
    });
  }
}
