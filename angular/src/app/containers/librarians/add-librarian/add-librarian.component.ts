import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable, Subject, Subscription } from 'rxjs';

import { ValidationService } from '../../../services/validation.service';
import { MaterialService } from '../../../services/material.service';
import { LibrarianService } from '../../../services/librarian.service';
import { ResponseService } from '../../../services/response.service';
import { DepartmentService } from '../../../services/department.service';
import { HelperService } from '../../../services/helper.service';

import { Department } from '../../../models/department.model';

import { AngularLinks } from '../../../constants/angularLinks';
import { PageTitles } from '../../../constants/pageTitles';

@Component({
    selector: 'app-create-user',
    templateUrl: './add-librarian.component.html'
})
export class AddLibrarianComponent implements OnInit, OnDestroy {
    createLibrarianForm: FormGroup;

    departments: Department[];

    done: boolean;

    createLibrarianSubscription: Subscription;
    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;

    error: string;

    emailValidation;

    discard: boolean;
    discardChanged = new Subject<boolean>();

    constructor(
        private librarianService: LibrarianService,
        private responseService: ResponseService,
        private helperService: HelperService,
        private router: Router,
        private materialService: MaterialService,
        private validationService: ValidationService,
        private departmentService: DepartmentService
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.ADD_LIBRARIAN;
        this.emailValidation = this.validationService.getEmailValidation();
        this.initializeForm();
        this.departmentsSubscriptionHandle();
    }

    initializeForm(): void {
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

    departmentsSubscriptionHandle(): void {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
            });
    }

    onCreateLibrarian(): void {
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
                if (this.responseService.responseHandle()) {
                    this.done = true;
                    this.router.navigate(['/', AngularLinks.LIBRARIANS]);
                } else {
                    this.error = this.responseService.getResponse().message;
                    this.createLibrarianForm.controls.email.setErrors({
                        incorrect: true
                    });
                }
            });
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.createLibrarianForm.touched && !this.done) {
            this.materialService.openDiscardChangesDialog(
                this.discard,
                this.discardChanged
            );
            return this.discardChanged;
        } else {
            return true;
        }
    }

    hasError(controlName: string, errorName: string): boolean {
        return this.createLibrarianForm.controls[controlName].hasError(
            errorName
        );
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.departmentsSubscription, [
            this.departmentsFetchSubscription,
            this.createLibrarianSubscription
        ]);
    }
}
