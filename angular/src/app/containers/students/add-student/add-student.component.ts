import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable, Subject, Subscription } from 'rxjs';

import { Response } from '../../../models/response.model';

import { AuthService } from '../../../services/auth.service';
import { ResponseService } from '../../../services/response.service';
import { MaterialService } from '../../../services/material.service';
import { ValidationService } from '../../../services/validation.service';
import { StudentService } from '../../../services/student.service';

import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { AngularLinks } from '../../../constants/angularLinks';

@Component({
    selector: 'app-add-student',
    templateUrl: './add-student.component.html'
})
export class AddStudentComponent implements OnInit, OnDestroy {
    createStudentForm: FormGroup;

    discard = false;
    done = false;

    createStudentSubscription: Subscription;

    error: string = null;
    emailError: string = null;
    readerTicketError: string = null;

    snackbarDuration = 5000;

    response: Response;

    emailValidation;
    readerTicketValidation;

    discardChanged = new Subject<boolean>();

    constructor(
        private authService: AuthService,
        private studentService: StudentService,
        private responseService: ResponseService,
        private router: Router,
        private materialService: MaterialService,
        private validationService: ValidationService
    ) {}

    ngOnInit() {
        document.title = 'Add librarian';
        this.emailValidation = this.validationService.getEmailValidation();
        this.readerTicketValidation = this.validationService.getReaderTicketValidation();
        this.initializeForm();
    }

    initializeForm() {
        this.createStudentForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email,
                Validators.pattern(this.emailValidation)
            ]),
            readerTicket: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.readerTicketValidation)
            ]),
            name: new FormControl(null, [Validators.required])
        });
    }

    onCreateStudent() {
        const email = this.createStudentForm.value.email;
        const readerTicket = this.createStudentForm.value.readerTicket;
        const name = this.createStudentForm.value.name;
        if (this.createStudentForm.invalid) {
            return;
        }

        if (
            !this.emailValidation.test(email) ||
            !this.readerTicketValidation.test(readerTicket)
        ) {
            return;
        }

        this.createStudentSubscription = this.studentService
            .addStudentHttp({
                email,
                name,
                readerTicket
            })
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                if (!this.response.isSuccessful) {
                    if (this.response.message.toLowerCase().includes('email')) {
                        this.emailError = this.response.message;
                        this.createStudentForm.controls.email.setErrors({
                            incorrect: true
                        });
                    } else if (
                        this.response.message.toLowerCase().includes('reader')
                    ) {
                        this.createStudentForm.controls.readerTicket.setErrors({
                            incorrect: true
                        });
                        this.readerTicketError = this.response.message;
                    } else {
                        this.materialService.openSnackBar(
                            this.response.message,
                            SnackBarClasses.Danger,
                            this.snackbarDuration
                        );
                    }
                } else {
                    this.done = true;
                    this.router.navigate(['/', AngularLinks.STUDENTS]);
                    this.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                }
            });
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.createStudentForm.touched && !this.done) {
            this.materialService.openDiscardChangesDialog(
                this.discard,
                this.discardChanged
            );
            return this.discardChanged;
        } else {
            return true;
        }
    }

    hasError(controlName: string, errorName: string) {
        return this.createStudentForm.controls[controlName].hasError(errorName);
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    ngOnDestroy(): void {
        if (this.createStudentSubscription) {
            this.createStudentSubscription.unsubscribe();
        }
    }
}
