import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { MaterialService } from '../../../shared/services/material.service';

import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { AngularLinks } from '../../../constants/angularLinks';
import { Response } from '../../../main-page/models/response.model';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;

    error: string = null;

    response: Response;
    authSubscription: Subscription;

    snackbarDuration = 5000;

    emailValidation;

    links = AngularLinks;

    constructor(
        private validationService: ValidationService,
        private authService: AuthService,
        private materialService: MaterialService,
        private router: Router
    ) {}

    ngOnInit() {
        document.title = 'Login';
        this.emailValidation = this.validationService.getEmailValidation();
        this.initializeForm();
    }

    initializeForm() {
        this.loginForm = new FormGroup({
            email: new FormControl('', [
                Validators.required,
                Validators.email,
                Validators.pattern(this.emailValidation)
            ]),
            password: new FormControl('', [Validators.required])
        });
    }

    hasError(controlName: string, errorName: string) {
        return this.loginForm.controls[controlName].hasError(errorName);
    }

    onLoginUser() {
        const email = this.loginForm.value.email;
        const password = this.loginForm.value.password;
        if (this.loginForm.invalid) {
            return;
        }
        const user = {
            email,
            password
        };
        this.authSubscription = this.authService.login(user).subscribe(() => {
            this.response = this.authService.getResponse();
            if (!this.response.isSuccessful) {
                this.loginForm.patchValue({
                    email,
                    password: ''
                });
                this.error = this.response.message;
                return false;
            } else {
                this.authService.setIsLoggedIn(this.response.isSuccessful);
                this.router.navigate([AngularLinks.HOME]);
                this.loginForm.reset();
                this.openSnackBar(
                    'You was logged in successfully',
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
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }
}
