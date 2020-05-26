import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Department } from '../../models/department.model';
import { Student } from '../../models/student.model';

import { DepartmentService } from '../../services/department.service';
import { ResponseService } from '../../services/response.service';
import { MaterialService } from '../../services/material.service';

import { SnackBarClasses } from '../../constants/snackBarClasses';
import { Period } from '../../models/period.model';
import { PeriodService } from '../../services/period.service';
import { HelperService } from '../../services/helper.service';
import { AuthService } from '../../services/auth.service';

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

    nothingToChange = 'Nothing to change';
    isManager: boolean;

    constructor(
        private departmentService: DepartmentService,
        private authService: AuthService,
        private responseService: ResponseService,
        private materialService: MaterialService,
        private periodService: PeriodService,
        private helperService: HelperService
    ) {}

    ngOnInit(): void {
        this.selectsValuesSubscriptionHandle();
        this.authService.isManager().then(isManager => {
            this.isManager = isManager;
        });
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
            .subscribe((periods: Period[]) => {
                this.periods = periods;
            });
    }

    nothingChangeHandle(): void {
        this.materialService.openSnackbar(
            this.nothingToChange,
            SnackBarClasses.Warn
        );
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.departmentsSubscription, [
            this.departmentsFetchSubscription,
            this.periodsSubscription,
            this.periodsFetchSubscription
        ]);
    }
}
