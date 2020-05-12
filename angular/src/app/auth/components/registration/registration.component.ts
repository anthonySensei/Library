import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { MaterialService } from '../../../shared/services/material.service';

import { AngularLinks } from '../../../constants/angularLinks';
import { SnackBarClasses } from '../../../constants/snackBarClasses';

import { Student } from '../../../user/models/student.model';
import { Response } from '../../../main-page/models/response.model';
import { ResponseService } from '../../../shared/services/response.service';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html'
})
export class RegistrationComponent implements OnInit, OnDestroy {
    mainInfoForm: FormGroup;
    passwordForm: FormGroup;

    error: string = null;
    snackbarDuration = 3000;

    response: Response;

    authSubscription: Subscription;

    emailValidation;
    passwordValidation;
    readerTicketValidation;

    hidePassword = true;
    hideRetypePassword = true;

    isPasswordError = false;

    links = AngularLinks;
    emailError: string;

    constructor(
        private validationService: ValidationService,
        private authService: AuthService,
        private responseService: ResponseService,
        private materialService: MaterialService,
        private router: Router
    ) {}

    ngOnInit() {
        document.title = 'Registration';
        this.emailValidation = this.validationService.getEmailValidation();
        this.passwordValidation = this.validationService.getPasswordValidation();
        this.readerTicketValidation = this.validationService.getReaderTicketValidation();
        this.formControlInitialization();
    }

    formControlInitialization() {
        this.mainInfoForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email,
                Validators.pattern(this.emailValidation)
            ]),
            reader_ticket: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.readerTicketValidation)
            ]),
            name: new FormControl(null, [Validators.required])
        });
        this.passwordForm = new FormGroup({
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
        if (this.mainInfoForm.controls[controlName]) {
            return this.mainInfoForm.controls[controlName].hasError(errorName);
        } else if (this.passwordForm.controls[controlName]) {
            return this.passwordForm.controls[controlName].hasError(errorName);
        }
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

    onRegisterUser(stepper) {
        const email = this.mainInfoForm.value.email;
        const readerTicket = this.mainInfoForm.value.reader_ticket;
        const name = this.mainInfoForm.value.name;
        const password = this.passwordForm.value.password;
        const password2 = this.passwordForm.value.password2;

        if (this.passwordForm.invalid || this.mainInfoForm.invalid) {
            stepper.selectedIndex = 0;
            return;
        }

        const student = new Student(
            null,
            name,
            email,
            null,
            readerTicket,
            password
        );

        if (!this.validationService.comparePasswords(password, password2)) {
            this.isPasswordError = true;
            this.error = 'Passwords are different';
            stepper.selectedIndex = 1;
            this.passwordForm.patchValue({
                password: '',
                password2: ''
            });
        } else {
            this.authSubscription = this.authService
                .registerStudentHttp(student)
                .subscribe(() => {
                    this.response = this.responseService.getResponse();
                    if (this.response && this.response.isSuccessful) {
                        this.router.navigate(['/' + this.links.LOGIN]);
                        this.materialService.openSnackBar(
                            this.response.message,
                            SnackBarClasses.Success,
                            this.snackbarDuration
                        );
                        this.isPasswordError = false;
                        this.passwordForm.patchValue({
                            password: '',
                            password2: ''
                        });
                    } else {
                        if (
                            this.response.message
                                .toLowerCase()
                                .includes('email')
                        ) {
                            stepper.selectedIndex = 0;
                            this.emailError = this.response.message;
                            this.mainInfoForm.controls.email.setErrors({
                                incorrect: true
                            });
                        } else if (
                            this.response.message
                                .toLowerCase()
                                .includes('reader')
                        ) {
                            stepper.selectedIndex = 0;
                            this.mainInfoForm.controls.reader_ticket.setErrors({
                                incorrect: true
                            });
                            this.error = this.response.message;
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
    }

    ngOnDestroy(): void {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }
}
