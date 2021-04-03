import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material';
import { Router } from '@angular/router';

import { Observable, Subject } from 'rxjs';

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
import { MaterialService } from '../../../services/material.service';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html'
})
export class RegistrationComponent implements OnInit, OnDestroy {

    hidePassword = true;
    hideRetypePassword = true;

    error: string;
    emailError: string;

    done: boolean;
    discard: boolean;
    isPasswordError: boolean;

    response: Response;
    links = AngularLinks;
    mainInfoForm: FormGroup;
    passwordForm: FormGroup;

    emailValidation: RegExp;
    passwordValidation: RegExp;
    readerTicketValidation: RegExp;

    discardChanged = new Subject<boolean>();


    constructor(
        private validationService: ValidationService,
        private authService: AuthService,
        private responseService: ResponseService,
        private materialService: MaterialService,
        private router: Router
    ) {
    }

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
            readerTicket: new FormControl(null, [Validators.required, Validators.pattern(this.readerTicketValidation)]),
            name: new FormControl(null, [Validators.required])
        });
        this.passwordForm = new FormGroup({
            password: new FormControl(null, [Validators.required, Validators.pattern(this.passwordValidation)]),
            password2: new FormControl(null, [Validators.required, Validators.pattern(this.passwordValidation)])
        });
    }

    hasError(controlName: string, errorName: string): boolean {
        return this.mainInfoForm.controls[controlName] ?
            this.mainInfoForm.controls[controlName].hasError(errorName) :
            this.passwordForm.controls[controlName].hasError(errorName);
    }

    checkIcon(hide: boolean, password: string): string {
        if (!password) {
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

        const student = new Student(null, name, email, null, readerTicket, password);

        if (!this.validationService.comparePasswords(password, password2)) {
            this.isPasswordError = true;
            this.error = ErrorMessages.DIFFERENT_PASSWORDS;
            stepper.selectedIndex = 1;
            this.passwordForm.patchValue({ password: '', password2: '' });
        } else {
            this.authService.registerStudentHttp(student).pipe(untilDestroyed(this)).subscribe(() => {
                if (this.responseService.responseHandle()) {
                    this.done = true;
                    this.router.navigate(['/' + this.links.LOGIN]);
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
            this.mainInfoForm.controls.email.setErrors({ incorrect: true });
        } else if (
            this.response.message.toLowerCase().includes(KeyWords.READER)
        ) {
            stepper.selectedIndex = 0;
            this.mainInfoForm.controls.reader_ticket.setErrors({ incorrect: true });
            this.error = this.response.message;
        }
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.mainInfoForm.touched && !this.done) {
            this.materialService.openDiscardChangesDialog(this.discard, this.discardChanged);
            return this.discardChanged;
        } else {
            return true;
        }
    }

    ngOnDestroy(): void {}
}
