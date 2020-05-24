import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { ChangePasswordDialogData } from './change-password-dialog-data.model';

import { ValidationService } from '../../../../services/validation.service';
import { UserService } from '../../../../services/user.service';
import { ResponseService } from '../../../../services/response.service';

import { ChangedDataProfile } from '../../../../constants/changedDataProfile';

@Component({
    selector: 'app-dialog',
    templateUrl: './change-password-modal.html'
})
export class ChangePasswordModalComponent implements OnInit, OnDestroy {
    passwordsForm: FormGroup;

    hideOldPassword = true;
    hideNewPassword = true;
    hideRetypePassword = true;

    passwordValidation;

    updateUserDataSubscription: Subscription;

    error: string;
    retypePasswordError: string;

    constructor(
        private validationService: ValidationService,
        private userService: UserService,
        private responseService: ResponseService,
        public dialogRef: MatDialogRef<ChangePasswordModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData
    ) {
        dialogRef.disableClose = true;
    }

    ngOnInit(): void {
        this.passwordValidation = this.validationService.getPasswordValidation();
        this.initializeForm();
    }

    initializeForm(): void {
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
        const oldPassword = this.passwordsForm.value.oldPassword;
        const newPassword = this.passwordsForm.value.newPassword;
        const retypeNewPassword = this.passwordsForm.value.retypeNewPassword;
        if (this.passwordsForm.invalid) {
            return;
        }
        if (newPassword !== retypeNewPassword) {
            this.retypePasswordError = 'Passwords are different';
            this.passwordsForm.controls.newPassword.setErrors({
                incorrect: true
            });
            this.passwordsForm.controls.retypeNewPassword.setErrors({
                incorrect: true
            });
        }
        const passwordsObject = {
            oldPassword,
            newPassword,
            retypeNewPassword
        };
        this.updateUserDataSubscription = this.userService
            .updateUserDataHttp(
                this.data.user,
                ChangedDataProfile.PASSWORD,
                passwordsObject
            )
            .subscribe(() => {
                this.responseHandle();
            });
    }

    responseHandle(): void {
        if (this.responseService.responseHandle()) {
            this.dialogRef.close();
        } else {
            if (
                this.responseService
                    .getResponse()
                    .message.toLowerCase()
                    .includes('password')
            ) {
                this.error = this.responseService.getResponse().message;
                this.passwordsForm.controls.oldPassword.setErrors({
                    incorrect: true
                });
            }
        }
    }

    checkIcon(hide: boolean, password: string): string {
        if (password == null || password === '') {
            return '';
        } else if (hide) {
            return 'visibility';
        } else {
            return 'visibility_off';
        }
    }

    hasError(controlName: string, errorName: string): boolean {
        return this.passwordsForm.controls[controlName].hasError(errorName);
    }

    ngOnDestroy(): void {
        if (this.updateUserDataSubscription) {
            this.updateUserDataSubscription.unsubscribe();
        }
    }
}
