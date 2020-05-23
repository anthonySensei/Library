import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Department } from '../../models/department.model';
import { Student } from '../../models/student.model';
import { Response } from '../../models/response.model';

import { DepartmentService } from '../../services/department.service';
import { ResponseService } from '../../services/response.service';
import { MaterialService } from '../../services/material.service';

import { SnackBarClasses } from '../../constants/snackBarClasses';
import { Period } from '../../models/period.model';
import { PeriodService } from '../../services/period.service';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.sass']
})
export class EditPageComponent implements OnInit, OnDestroy {
    departments: Department[];
    students: Student[];
    periods: Period[];

    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    periodsSubscription: Subscription;
    periodsFetchSubscription: Subscription;

    departmentSelect: number;

    snackbarDuration = 3000;
    nothingToChange = 'Nothing to change';

    response: Response;

    constructor(
        private departmentService: DepartmentService,
        private responseService: ResponseService,
        private materialService: MaterialService,
        private periodService: PeriodService
    ) {}

    ngOnInit(): void {
        this.selectsValuesSubscriptionHandle();
    }

    selectsValuesSubscriptionHandle(): void {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
            });
        this.periodsFetchSubscription = this.periodService
            .fetchAllPeriodsHttp()
            .subscribe();
        this.periodsSubscription = this.periodService
            .getPeriods()
            .subscribe(periods => {
                this.periods = periods;
            });
    }

    nothingChangeHandle(): void {
        this.openSnackBar(
            this.nothingToChange,
            SnackBarClasses.Warn,
            this.snackbarDuration
        );
    }

    openSnackBar(message: string, style: string, duration: number): void {
        this.materialService.openSnackBar(message, style, duration);
    }

    ngOnDestroy(): void {
        this.departmentsSubscription.add(this.departmentsFetchSubscription);
        this.departmentsSubscription.add(this.periodsSubscription);
        this.departmentsSubscription.add(this.periodsFetchSubscription);
        this.departmentsSubscription.unsubscribe();
    }
}
