import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AccountUser } from "../../../../interface/account.interface";
import { AccountState } from '../../../../state/account.state';
import { UpdateUserProfile } from '../../../../action/account.action';
import * as data from '../../../../data/country-code';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent {

  @Select(AccountState.user) user$: Observable<AccountUser>;

  public form: FormGroup;
  public closeResult: string;

  public modalOpen: boolean = false;
  public flicker: boolean = false;
  public codes = data.countryCodes;

  @ViewChild("profileModal", { static: false }) ProfileModal: TemplateRef<string>;
  
  constructor(private modalService: NgbModal,
    private store: Store,
    private formBuilder: FormBuilder) {
      this.user$.subscribe(user => {
        this.flicker = true;
        this.form = this.formBuilder.group({
          name: new FormControl(user?.name, [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]),
          email: new FormControl(user?.email, [Validators.required, Validators.email]),
          phone: new FormControl(user?.phone, [Validators.required, Validators.pattern(/^[0-9]*$/)]),
          country_code: new FormControl(user?.country_code), 
          profile_image_id: new FormControl(user?.profile_image_id),
          _method: new FormControl('PUT'),
        });

        // Enforce 10-digit phone length and sanitize overflow
        this.form.controls['phone']?.valueChanges.subscribe((value) => {
          if(value && value.toString().length < 10) {
            this.form.controls['phone'].markAsTouched();
            this.form.controls['phone'].setErrors({invalid: true});
          }
          if(value && value.toString().length > 10) {
            this.form.controls['phone']?.setValue(value.toString().slice(0, 10), { emitEvent: false });
          }
          if(value && value.toString().length === 10) {
            // preserve other errors (like pattern) if present
            if (this.form.controls['phone'].errors) {
              const { invalid, ...rest } = this.form.controls['phone'].errors as any;
              const newErrors = Object.keys(rest).length ? rest : null;
              this.form.controls['phone'].setErrors(newErrors);
            }
          }
        });
        setTimeout( () => this.flicker = false, 200);
      });
  }

  async openModal() {
    this.modalOpen = true;
    this.modalService.open(this.ProfileModal, {
      ariaLabelledBy: 'profile-Modal',
      centered: true,
      windowClass: 'theme-modal'
    }).result.then((result) => {
      `Result ${result}`
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: ModalDismissReasons): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  submit(){
    this.form.markAllAsTouched();
    if(this.form.valid) {
      this.store.dispatch(new UpdateUserProfile(this.form.value))
    }
  }

  // Allow only alphabets and space in name field
  allowOnlyAlphabets(event: KeyboardEvent) {
    const key = event.key;
    const isAllowed = /^[A-Za-z ]$/.test(key) || key === 'Backspace' || key === 'Tab' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Delete' || key === 'Home' || key === 'End';
    if (!isAllowed) {
      event.preventDefault();
    }
  }

  // Sanitize name input to strip non-letters/spaces
  sanitizeNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^A-Za-z ]+/g, '');
    if (sanitized !== input.value) {
      this.form.controls['name'].setValue(sanitized, { emitEvent: false });
    }
  }

  // Allow only digits in phone field
  allowOnlyDigits(event: KeyboardEvent) {
    const key = event.key;
    const isAllowed = /[0-9]/.test(key) || key === 'Backspace' || key === 'Tab' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Delete' || key === 'Home' || key === 'End';
    if (!isAllowed) {
      event.preventDefault();
    }
  }

  // Sanitize phone input to keep digits only up to 10
  sanitizePhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D+/g, '').slice(0, 10);
    const current = (this.form.controls['phone'].value ?? '').toString();
    if (cleaned !== current) {
      this.form.controls['phone'].setValue(cleaned, { emitEvent: false });
    }
  }

  ngOnDestroy() {
    if(this.modalOpen) {
      this.modalService.dismissAll();
    }
  }

}
