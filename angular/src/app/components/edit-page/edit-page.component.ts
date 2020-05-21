import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Department } from '../../models/department.model';
import { Student } from '../../models/student.model';
import { Response } from '../../models/response.model';

import { DepartmentService } from '../../services/department.service';
import { ResponseService } from '../../services/response.service';
import { MaterialService } from '../../services/material.service';

import { SnackBarClasses } from '../../constants/snackBarClasses';
import { LibrarianService } from '../../services/librarian.service';
import { Period } from '../../models/period.model';
import { PeriodService } from '../../services/period.service';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.sass']
})
export class EditPageComponent implements OnInit {
    departments: Department[];
    students: Student[];
    periods: Period[];

    departmentsFetchSubscription: Subscription;
    departmentsChangeSubscription: Subscription;
    periodsFetchSubscription: Subscription;
    periodsChangeSubscription: Subscription;

    departmentSelect = null;

    snackbarDuration = 3000;
    nothingToChange = 'Nothing to change';

    response: Response;

    constructor(
        private departmentService: DepartmentService,
        private responseService: ResponseService,
        private materialService: MaterialService,
        private periodService: PeriodService
    ) {}

    ngOnInit() {
        this.selectsValuesSubscriptionHandle();
    }

    selectsValuesSubscriptionHandle() {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsChangeSubscription = this.departmentService.departmentsChanged.subscribe(
            departments => {
                this.departments = departments;
            }
        );
        this.periodsFetchSubscription = this.periodService
            .fetchAllPeriodsHttp()
            .subscribe();
        this.periodsChangeSubscription = this.periodService.periodsChanged.subscribe(
            periods => {
                this.periods = periods;
            }
        );
    }

    nothingChangeHandle() {
        this.openSnackBar(
            this.nothingToChange,
            SnackBarClasses.Warn,
            this.snackbarDuration
        );
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }
}
