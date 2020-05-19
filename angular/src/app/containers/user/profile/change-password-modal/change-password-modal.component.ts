import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ChangePasswordDialogData } from './change-password-dialog-data.model';
import { ValidationService } from '../../../../services/validation.service';
import { SnackBarClasses } from '../../../../constants/snackBarClasses';
import { UserService } from '../../../../services/user.service';
import { Subscription } from 'rxjs';
import { ChangedDataProfile } from '../../../../constants/changedDataProfile';
import { ResponseService } from '../../../../services/response.service';
import { Response } from '../../../../models/response.model';
import { MaterialService } from '../../../../services/material.service';

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

    response: Response;

    snackbarDuration = 5000;

    constructor(
        private validationService: ValidationService,
        private userService: UserService,
        private responseService: ResponseService,
        private materialService: MaterialService,
        public dialogRef: MatDialogRef<ChangePasswordModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData
    ) {
        dialogRef.disableClose = true;
    }

    ngOnInit(): void {
        this.passwordValidation = this.validationService.getPasswordValidation();
        this.initializeForm();
    }

    initializeForm() {
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

    onChangeUserPassword() {
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
                this.response = this.responseService.getResponse();
                if (this.response.isSuccessful) {
                    this.dialogRef.close();
                    this.materialService.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                } else {
                    if (
                        this.response.message.toLowerCase().includes('password')
                    ) {
                        this.error = this.response.message;
                        this.passwordsForm.controls.oldPassword.setErrors({
                            incorrect: true
                        });
                    } else {
                        this.materialService.openSnackBar(
                            this.response.message,
                            SnackBarClasses.Danger,
                            this.snackbarDuration
                        );
                    }
                }
            });
    }

    checkIcon(hide: boolean, password: string) {
        if (password == null || password === '') {
            return '';
        } else if (hide) {
            return 'visibility';
        } else {
            return 'visibility_off';
        }
    }

    hasError(controlName: string, errorName: string) {
        return this.passwordsForm.controls[controlName].hasError(errorName);
    }

    ngOnDestroy(): void {
        if (this.updateUserDataSubscription) {
            this.updateUserDataSubscription.unsubscribe();
        }
    }
}
