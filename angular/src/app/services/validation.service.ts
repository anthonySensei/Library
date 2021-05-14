import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ValidationService {
    private emailValidation = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    private passwordValidation = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    private isbnValidation = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/;
    private phoneValidation = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;

    constructor() {}

    getEmailValidation() {
        return this.emailValidation;
    }

    getPhoneValidation() {
        return this.phoneValidation;
    }

    getPasswordValidation() {
        return this.passwordValidation;
    }

    getIsbnValidation() {
        return this.isbnValidation;
    }

    comparePasswords(password, passwordRetype): boolean {
        return password === passwordRetype;
    }

    RequireMatch(control: AbstractControl) {
        const selection: any = control.value;

        if (typeof selection === 'string') {
            return { incorrect: true };
        }

        return null;
    }
}
