import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { MaterialService } from '../../../shared/services/material.service';

import { Observable, Subject, Subscription } from 'rxjs';

import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { LibrarianService } from '../../services/librarian.service';
import { Response } from '../../../main-page/models/response.model';
import { ResponseService } from '../../../shared/services/response.service';

@Component({
    selector: 'app-create-user',
    templateUrl: './add-librarian.component.html'
})
export class AddLibrarianComponent implements OnInit, OnDestroy {
    createUserForm: FormGroup;

    discard = false;

    JSONSubscription: Subscription;
    createUserSubscription: Subscription;

    error: string = null;

    snackbarDuration = 5000;

    response: Response;

    emailValidation;

    discardChanged = new Subject<boolean>();

    constructor(
        private authService: AuthService,
        private librarianService: LibrarianService,
        private responseService: ResponseService,
        private router: Router,
        private materialService: MaterialService,
        private validationService: ValidationService
    ) {}

    ngOnInit() {
        document.title = 'Add user';
        this.emailValidation = this.validationService.getEmailValidation();
        this.initializeForm();
    }

    initializeForm() {
        this.createUserForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email,
                Validators.pattern(this.emailValidation)
            ])
        });
    }

    onCreateUser() {
        const email = this.createUserForm.value.email;
        if (this.createUserForm.invalid) {
            return;
        }
        if (!this.emailValidation.test(email)) {
            return;
        }
        this.createUserSubscription = this.librarianService
            .addLibrarianHttp(email)
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                if (!this.response.isSuccessful) {
                    this.error = this.response.message;
                    this.createUserForm.controls.email.setErrors({
                        incorrect: true
                    });
                } else {
                    this.router.navigate(['/books']);
                    this.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                }
            });
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.createUserForm.touched) {
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
        return this.createUserForm.controls[controlName].hasError(errorName);
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    ngOnDestroy(): void {
        if (this.createUserSubscription) {
            this.createUserSubscription.unsubscribe();
        }
    }
}
