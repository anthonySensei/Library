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
import { DepartmentService } from '../../../main-page/services/department.service';
import { Department } from '../../../main-page/models/department.model';

@Component({
    selector: 'app-create-user',
    templateUrl: './add-librarian.component.html'
})
export class AddLibrarianComponent implements OnInit, OnDestroy {
    createLibrarianForm: FormGroup;

    departments: Department[];

    discard = false;

    createLibrarianSubscription: Subscription;
    departmentChangeSubscription: Subscription;
    departmentFetchSubscription: Subscription;

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
        private validationService: ValidationService,
        private departmentService: DepartmentService
    ) {}

    ngOnInit() {
        document.title = 'Add librarian';
        this.emailValidation = this.validationService.getEmailValidation();
        this.initializeForm();
        this.departmentsSubscriptionHandle();
    }

    initializeForm() {
        this.createLibrarianForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email,
                Validators.pattern(this.emailValidation)
            ]),
            name: new FormControl(null, [Validators.required]),
            department: new FormControl(null, [Validators.required])
        });
    }

    departmentsSubscriptionHandle() {
        this.departmentFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentChangeSubscription = this.departmentService.departmentsChanged.subscribe(
            departments => {
                this.departments = departments;
            }
        );
    }

    onCreateLibrarian() {
        const email = this.createLibrarianForm.value.email;
        const departmentId = this.createLibrarianForm.value.department;
        const name = this.createLibrarianForm.value.name;
        if (this.createLibrarianForm.invalid) {
            return;
        }

        if (!this.emailValidation.test(email)) {
            return;
        }

        this.createLibrarianSubscription = this.librarianService
            .addLibrarianHttp({
                email,
                departmentId,
                name
            })
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                if (!this.response.isSuccessful) {
                    this.error = this.response.message;
                    this.createLibrarianForm.controls.email.setErrors({
                        incorrect: true
                    });
                } else {
                    this.router.navigate(['/librarians']);
                    this.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                }
            });
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.createLibrarianForm.touched && !this.response.isSuccessful) {
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
        return this.createLibrarianForm.controls[controlName].hasError(errorName);
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    ngOnDestroy(): void {
        if (this.createLibrarianSubscription) {
            this.createLibrarianSubscription.unsubscribe();
        }
    }
}
