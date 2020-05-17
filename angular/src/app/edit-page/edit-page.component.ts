import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Department } from '../main-page/models/department.model';
import { Student } from '../user/models/student.model';
import { Response } from '../main-page/models/response.model';

import { DepartmentService } from '../main-page/services/department.service';
import { ResponseService } from '../shared/services/response.service';
import { MaterialService } from '../shared/services/material.service';

import { SnackBarClasses } from '../constants/snackBarClasses';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.sass']
})
export class EditPageComponent implements OnInit {
    departments: Department[];
    students: Student[];

    departmentsFetchSubscription: Subscription;
    departmentsChangeSubscription: Subscription;

    departmentSelect = null;

    snackbarDuration = 3000;
    nothingToChange = 'Nothing to change';

    response: Response;

    constructor(
        private departmentService: DepartmentService,
        private responseService: ResponseService,
        public materialService: MaterialService
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
