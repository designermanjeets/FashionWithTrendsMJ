import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetPaymentDetails, UpdatePaymentDetails } from '../../../shared/action/payment-details.action';
import { PaymentDetailsState } from '../../../shared/state/payment-details.state';
import { PaymentDetails } from '../../../shared/interface/payment-details.interface';

@Component({
  selector: 'app-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent {

  @Select(PaymentDetailsState.paymentDetails) paymentDetails$: Observable<PaymentDetails>;
  
  public form: FormGroup;
  public active = 'bank';

  constructor(private store: Store) {
    this.form = new FormGroup({
      bank_account_no: new FormControl('', [Validators.pattern(/^[0-9]*$/)]),
      bank_name: new FormControl('', [Validators.pattern(/^[A-Za-z ]+$/)]),
      bank_holder_name: new FormControl('', [Validators.pattern(/^[A-Za-z ]+$/)]),
      swift: new FormControl(),
      ifsc: new FormControl(),
      paypal_email: new FormControl('', [Validators.email]),
    });

    // Keep only digits in account number
    this.form.controls['bank_account_no']?.valueChanges.subscribe((value) => {
      const cleaned = (value ?? '').toString().replace(/\D+/g, '');
      if (cleaned !== (value ?? '').toString()) {
        this.form.controls['bank_account_no'].setValue(cleaned, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(new GetPaymentDetails());
    this.paymentDetails$.subscribe(paymentDetails => {
      this.form.patchValue({
        bank_account_no: paymentDetails?.bank_account_no,
        bank_name: paymentDetails?.bank_name,
        bank_holder_name: paymentDetails?.bank_holder_name,
        swift:paymentDetails?.swift,
        ifsc: paymentDetails?.ifsc,
        paypal_email: paymentDetails?.paypal_email
      })
    });
  }

  submit(){    
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.store.dispatch(new UpdatePaymentDetails(this.form.value))
    }
  }

  // Allow only alphabets and spaces
  allowOnlyAlphabets(event: KeyboardEvent) {
    const key = event.key;
    const isAllowed = /^[A-Za-z ]$/.test(key) || key === 'Backspace' || key === 'Tab' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Delete' || key === 'Home' || key === 'End';
    if (!isAllowed) {
      event.preventDefault();
    }
  }

  // Sanitize input to contain only letters and spaces
  sanitizeAlphaInput(controlName: 'bank_name' | 'bank_holder_name', event: Event) {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^A-Za-z ]+/g, '');
    if (sanitized !== input.value) {
      this.form.controls[controlName].setValue(sanitized, { emitEvent: false });
    }
  }

  // Allow only digits
  allowOnlyDigits(event: KeyboardEvent) {
    const key = event.key;
    const isAllowed = /[0-9]/.test(key) || key === 'Backspace' || key === 'Tab' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Delete' || key === 'Home' || key === 'End';
    if (!isAllowed) {
      event.preventDefault();
    }
  }

  // Sanitize to digits only for account number
  sanitizeAccountNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D+/g, '');
    const current = (this.form.controls['bank_account_no'].value ?? '').toString();
    if (cleaned !== current) {
      this.form.controls['bank_account_no'].setValue(cleaned, { emitEvent: false });
    }
  }

}
