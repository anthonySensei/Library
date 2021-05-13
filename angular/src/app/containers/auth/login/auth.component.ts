import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { untilDestroyed } from 'ngx-take-until-destroy';

import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';

import { AngularLinks } from '../../../constants/angularLinks';
import { PageTitles } from '../../../constants/pageTitles';
import { Store } from '@ngxs/store';
import { Login } from '../../../store/state/user.state';
import { StoreStateModel } from '../../../store/models/store.model';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {

    error: boolean;
    loginForm: FormGroup;
    links = AngularLinks;
    emailValidation: RegExp;

    constructor(
        private validationService: ValidationService,
        private authService: AuthService,
        private router: Router,
        private store: Store
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.LOGIN;
        this.emailValidation = this.validationService.getEmailValidation();
        this.initializeForm();
    }

    initializeForm(): void {
        this.loginForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(this.emailValidation)]),
            password: new FormControl('', [Validators.required])
        });
    }

    hasError(controlName: string, errorName: string): boolean {
        return this.loginForm.controls[controlName].hasError(errorName);
    }

    onLoginUser(): void {
        const email = this.loginForm.value.email;
        const password = this.loginForm.value.password;

        if (this.loginForm.invalid) {
            return;
        }

        this.store.dispatch(new Login(email, password)).pipe(untilDestroyed(this)).subscribe(async (state: StoreStateModel) => {
            if (state.user.user) {
                return;
            }

            this.loginForm.patchValue({ email, password: '' });
            this.error = true;
        });
    }

    ngOnDestroy(): void {}
}
