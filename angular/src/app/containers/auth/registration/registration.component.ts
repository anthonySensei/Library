import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { ResponseService } from '../../../services/response.service';

import { AngularLinks } from '../../../constants/angularLinks';

import { Student } from '../../../models/student.model';
import { Response } from '../../../models/response.model';
import { PasswordVisibility } from '../../../constants/passwordVisibility';
import { ErrorMessages } from '../../../constants/errorMessages';
import { KeyWords } from '../../../constants/keyWords';
import { PageTitles } from '../../../constants/pageTitles';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html'
})
export class RegistrationComponent implements OnInit, OnDestroy {
    mainInfoForm: FormGroup;
    passwordForm: FormGroup;

    error: string;
    emailError: string;

    authSubscription: Subscription;

    emailValidation;
    passwordValidation;
    readerTicketValidation;

    hidePassword = true;
    hideRetypePassword = true;

    isPasswordError: boolean;

    links = AngularLinks;

    response: Response;

    constructor(
        private validationService: ValidationService,
        private authService: AuthService,
        private responseService: ResponseService,
        private router: Router
    ) {}

    ngOnInit() {
        document.title = PageTitles.REGISTRATION;
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

    hasError(controlName: string, errorName: string): boolean {
        if (this.mainInfoForm.controls[controlName]) {
            return this.mainInfoForm.controls[controlName].hasError(errorName);
        } else if (this.passwordForm.controls[controlName]) {
            return this.passwordForm.controls[controlName].hasError(errorName);
        }
    }

    checkIcon(hide: boolean, password: string): string {
        if (password == null || password === '') {
            return '';
        } else if (hide) {
            return PasswordVisibility.VISIBLE;
        } else {
            return PasswordVisibility.INVISIBLE;
        }
    }

    onRegisterUser(stepper: MatHorizontalStepper): void {
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
            this.error = ErrorMessages.DIFFERENT_PASSWORDS;
            stepper.selectedIndex = 1;
            this.passwordForm.patchValue({
                password: '',
                password2: ''
            });
        } else {
            this.authSubscription = this.authService
                .registerStudentHttp(student)
                .subscribe(() => {
                    if (this.responseService.responseHandle()) {
                        this.router.navigate(['/' + this.links.LOGIN]);
                        this.isPasswordError = false;
                        this.passwordForm.patchValue({
                            password: '',
                            password2: ''
                        });
                    } else {
                        this.fieldsErrorHandle(stepper);
                    }
                });
        }
    }

    fieldsErrorHandle(stepper: MatHorizontalStepper): void {
        this.response = this.responseService.getResponse();
        if (this.response.message.toLowerCase().includes(KeyWords.EMAIL)) {
            stepper.selectedIndex = 0;
            this.emailError = this.response.message;
            this.mainInfoForm.controls.email.setErrors({
                incorrect: true
            });
        } else if (
            this.response.message.toLowerCase().includes(KeyWords.READER)
        ) {
            stepper.selectedIndex = 0;
            this.mainInfoForm.controls.reader_ticket.setErrors({
                incorrect: true
            });
            this.error = this.response.message;
        }
    }

    ngOnDestroy(): void {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }
}
