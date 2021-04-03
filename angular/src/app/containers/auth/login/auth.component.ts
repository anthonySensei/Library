import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { untilDestroyed } from 'ngx-take-until-destroy';

import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { ResponseService } from '../../../services/response.service';

import { AngularLinks } from '../../../constants/angularLinks';
import { PageTitles } from '../../../constants/pageTitles';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {

    error: string;
    loginForm: FormGroup;
    links = AngularLinks;
    emailValidation: RegExp;

    constructor(
        private validationService: ValidationService,
        private authService: AuthService,
        private responseService: ResponseService,
        private router: Router
    ) {
    }

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
        const user = { email, password };
        this.authService.login(user).pipe(untilDestroyed(this)).subscribe(() => {
            if (this.responseService.responseHandle()) {
                this.authService.setIsLoggedIn(this.responseService.getResponse().isSuccessful);
                this.router.navigate([AngularLinks.HOME]);
                this.loginForm.reset();
            } else {
                this.loginForm.patchValue({ email, password: '' });
                this.error = this.responseService.getResponse().message;
            }
        });
    }

    ngOnDestroy(): void {}
}
