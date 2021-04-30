import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ChangePasswordDialogData } from './change-password-dialog-data.model';

import { ValidationService } from '../../../../services/validation.service';
import { UserService } from '../../../../services/user.service';
import { ResponseService } from '../../../../services/response.service';
import { ErrorMessages } from '../../../../constants/errorMessages';
import { PasswordVisibility } from '../../../../constants/passwordVisibility';
import { Store } from '@ngxs/store';
import { EditPassword } from '../../../../store/user.state';

@Component({
    selector: 'app-dialog',
    templateUrl: './change-password-modal.html'
})
export class ChangePasswordModalComponent implements OnInit, OnDestroy {
    passwordsForm: FormGroup;

    hideOldPassword = true;
    hideNewPassword = true;
    hideRetypePassword = true;

    passwordValidation: RegExp;

    error: string;
    retypePasswordError: string;

    constructor(
        private validationService: ValidationService,
        private userService: UserService,
        private responseService: ResponseService,
        private store: Store,
        public dialogRef: MatDialogRef<ChangePasswordModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData
    ) {
        dialogRef.disableClose = true;
    }

    ngOnInit(): void {
        this.passwordValidation = this.validationService.getPasswordValidation();
        this.initForm();
    }

    initForm(): void {
        this.passwordsForm = new FormGroup({
            oldPassword: new FormControl(null, [Validators.required]),
            newPassword: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.passwordValidation)
            ]),
            retypeNewPassword: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.passwordValidation)
            ])
        });
    }

    onChangeUserPassword(): void {
        const { oldPassword, newPassword, retypeNewPassword } = this.passwordsForm.value;

        if (this.passwordsForm.invalid) {
            return;
        }

        if (newPassword !== retypeNewPassword) {
            this.retypePasswordError = ErrorMessages.DIFFERENT_PASSWORDS;
            this.passwordsForm.controls.newPassword.setErrors({ incorrect: true });
            this.passwordsForm.controls.retypeNewPassword.setErrors({ incorrect: true });
        }

        this.store.dispatch(new EditPassword({ oldPassword, newPassword })).subscribe(() => this.dialogRef.close());
    }

    checkIcon(hide: boolean, password: string): string {
        if (!password) {
            return '';
        }

        if (hide) {
            return PasswordVisibility.VISIBLE;
        }

        return PasswordVisibility.INVISIBLE;
    }

    hasError(controlName: string, errorName: string): boolean {
        return this.passwordsForm.controls[controlName].hasError(errorName);
    }

    ngOnDestroy(): void {}
}
