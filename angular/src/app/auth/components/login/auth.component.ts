import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { MaterialService } from '../../../shared/services/material.service';

import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { AngularLinks } from '../../../constants/angularLinks';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;

    error: string = null;
    message: string = null;

    loggedIn = false;

    JSONSubscription: Subscription;
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
        this.subscriptionsHandler();
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

    subscriptionsHandler() {
        this.JSONSubscription = this.authService.authJSONResponseChanged.subscribe(
            (JSONResponse: {
                responseCode: number;
                data: {
                    loggedIn: boolean;
                    message: string;
                };
            }) => {
                this.message = JSONResponse.data.message;
                this.loggedIn = JSONResponse.data.loggedIn;
            }
        );
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
            if (!this.loggedIn) {
                this.loginForm.patchValue({
                    email,
                    password: ''
                });
                this.error = this.message;
                return false;
            } else {
                this.authService.setIsLoggedIn(this.loggedIn);
                this.router.navigate([AngularLinks.HOME]);
                this.loginForm.reset();
                this.message = 'You was logged in successfully';
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
