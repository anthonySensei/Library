import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserPopupData } from '@shared/user-popup/user-popup.data';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';
import { Store } from '@ngxs/store';
import { CreateUser, EditUser } from '../../store/user.state';

@Component({
  selector: 'app-user-popup',
  templateUrl: './user-popup.component.html',
  styleUrls: ['./user-popup.component.scss']
})
export class UserPopupComponent implements OnInit {

  form: FormGroup;
  emailValidation: RegExp;
  phoneValidation: RegExp;

  constructor(
      private validationService: ValidationService,
      private dialog: MatDialogRef<UserPopupData>,
      private store: Store,
      @Inject(MAT_DIALOG_DATA) public data: UserPopupData,
  ) { }

  ngOnInit(): void {
    this.initValidations();
    this.initForm();
  }

  initValidations() {
    this.emailValidation = this.validationService.getEmailValidation();
    this.phoneValidation = this.validationService.getPhoneValidation();
  }

  initForm() {
    const { user } = this.data;
    this.form = new FormGroup({
      email: new FormControl(user?.email || '', [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailValidation)
      ]),
      name: new FormControl(user?.name || '', [Validators.required]),
      phone: new FormControl(user?.phone || '', [Validators.required, Validators.pattern(this.phoneValidation)]),
    });
  }

  isValid(): boolean {
    return this.form.valid;
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.form.controls[controlName].hasError(errorName);
  }

  getTitle(): string {
    const { isEdit } = this.data;
    return isEdit ? 'Edit User' : 'Create User';
  }

  getActionTitle(): string {
    return this.data.isEdit ? 'Edit' : 'Create';
  }

  createUser() {
    const { email, name, phone } = this.form.value;

    if (!this.isValid()) {
      return;
    }

    this.store.dispatch(new CreateUser({email, name, phone})).subscribe(() => this.onClose(true));
  }

  editUser() {
    const { user } = this.data;
    const { email, name, phone } = this.form.value;

    if (!this.isValid()) {
      return;
    }

    this.store.dispatch(new EditUser({email, name, phone}, user.id)).subscribe(() => this.onClose(true));
  }

  onDoAction() {
    const { isEdit } = this.data;
    isEdit ? this.editUser() : this.createUser();
  }

  onClose(completed?: boolean) {
    this.dialog.close(completed);
  }
}
