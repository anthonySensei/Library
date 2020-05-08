import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Subject, Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { MaterialService } from '../../../shared/services/material.service';
import { AngularLinks } from '../../../constants/angularLinks';
import { SnackBarClasses } from '../../../constants/snackBarClasses';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['../login/auth.component.sass']
})
export class RegistrationComponent implements OnInit, OnDestroy {
    regForm: FormGroup;

    error: string = null;
    message: string = null;
    snackbarDuration = 3000;

    created = false;

    JSONSubscription: Subscription;
    authSubscription: Subscription;

    emailValidation;
    passwordValidation;
    readerTicketValidation;

    hidePassword = true;
    hideRetypePassword = true;

    isPasswordError = false;

    isDone = false;

    links = AngularLinks;
    emailError: string;

    constructor(
        private validationService: ValidationService,
        private authService: AuthService,
        private materialService: MaterialService,
        private router: Router
    ) {}

    ngOnInit() {
        document.title = 'Registration';
        this.emailValidation = this.validationService.getEmailValidation();
        this.passwordValidation = this.validationService.getPasswordValidation();
        this.readerTicketValidation = this.validationService.getReaderTicketValidation();
        this.formControlInitialization();
        this.handleJSON();
    }

    handleJSON() {
        this.JSONSubscription = this.authService.authJSONResponseChanged.subscribe(
            (JSONResponse: {
                responseCod: string;
                data: {
                    created: boolean;
                    message: string;
                };
            }) => {
                this.message = JSONResponse.data.message;
                this.created = JSONResponse.data.created;
            }
        );
    }

    formControlInitialization() {
        this.regForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email,
                Validators.pattern(this.emailValidation)
            ]),
            reader_ticket: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.readerTicketValidation)
            ]),
            password: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.passwordValidation)
            ]),
            password2: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.passwordValidation)
            ])
        });
    }

    hasError(controlName: string, errorName: string) {
        return this.regForm.controls[controlName].hasError(errorName);
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

    onRegisterUser() {
        const email = this.regForm.value.email;
        const readerTicket = this.regForm.value.reader_ticket;
        const password = this.regForm.value.password;
        const password2 = this.regForm.value.password2;

        if (this.regForm.invalid) {
            return;
        }

        const user = {
            email,
            readerTicket,
            password
        };

        if (!this.validationService.comparePasswords(password, password2)) {
            this.isPasswordError = true;
            this.error = 'Passwords are different';
            this.regForm.patchValue({
                email,
                password: '',
                password2: ''
            });
            return false;
        }

        this.authSubscription = this.authService
            .registerUserHttp(user)
            .subscribe(() => {
                if (!this.created) {
                    this.isDone = true;
                    this.isPasswordError = false;
                    this.regForm.patchValue({
                        password: '',
                        password2: ''
                    });

                    if (
                        this.message.toLowerCase().split(' ').includes('email')
                    ) {
                        this.emailError = this.message;
                        this.regForm.controls.email.setErrors({
                            incorrect: true
                        });
                    } else {
                        this.regForm.controls.reader_ticket.setErrors({
                            incorrect: true
                        });
                        this.error = this.message;
                    }
                } else {
                    this.isDone = false;
                    this.router.navigate(['/' + this.links.LOGIN]);
                    this.message =
                        'You have been successfully registered. Please check your email to activate account';
                    this.openSnackBar(
                        this.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                }
            });
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    ngOnDestroy(): void {
        this.JSONSubscription.unsubscribe();
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }
}
