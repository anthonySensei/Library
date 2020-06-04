import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ValidationService {
    private emailValidation = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    private passwordValidation = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    private readerTicketValidation = /^([1-9][0-9]{9})$/;
    private isbnValidation = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/;
    private yearValidation = [
        Validators.max(new Date().getFullYear()),
        Validators.min(0)
    ];

    constructor() {}

    getEmailValidation() {
        return this.emailValidation;
    }

    getPasswordValidation() {
        return this.passwordValidation;
    }

    getReaderTicketValidation() {
        return this.readerTicketValidation;
    }

    getIsbnValidation() {
        return this.isbnValidation;
    }

    getYearValidation() {
        return this.yearValidation;
    }

    comparePasswords(password, passwordRetype): boolean {
        return password === passwordRetype;
    }
}
