import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Department } from '../../models/department.model';
import { Student } from '../../models/student.model';
import { Period } from '../../models/period.model';
import { Librarian } from '../../models/librarian.model';

import { DepartmentService } from '../../services/department.service';
import { ResponseService } from '../../services/response.service';
import { MaterialService } from '../../services/material.service';

import { PeriodService } from '../../services/period.service';
import { HelperService } from '../../services/helper.service';
import { AuthService } from '../../services/auth.service';
import { LibrarianService } from '../../services/librarian.service';

import { SnackBarClasses } from '../../constants/snackBarClasses';
import { PageTitles } from '../../constants/pageTitles';
import { WarnMessages } from '../../constants/warnMessages';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.sass']
})
export class EditPageComponent implements OnInit, OnDestroy {
    departments: Department[];
    librarians: Librarian[];
    students: Student[];
    periods: Period[];

    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    periodsSubscription: Subscription;
    periodsFetchSubscription: Subscription;
    librariansSubscription: Subscription;
    librariansFetchSubscription: Subscription;

    departmentSelect: number;

    nothingToChange = WarnMessages.NOTHING_TO_CHANGE;
    isManager: boolean;

    constructor(
        private departmentService: DepartmentService,
        private authService: AuthService,
        private responseService: ResponseService,
        private materialService: MaterialService,
        private periodService: PeriodService,
        private helperService: HelperService,
        private librarianService: LibrarianService
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.MANAGING;
        this.selectsValuesSubscriptionHandle();
        this.authService.isManager().then((isManager: boolean) => {
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
        this.onSetLibrarians();
    }

    onSetLibrarians(): void {
        this.librariansFetchSubscription = this.librarianService
            .getAllLibrariansHttp()
            .subscribe();
        this.librariansSubscription = this.librarianService
            .getLibrarians()
            .subscribe((librarians: Librarian[]) => {
                this.librarians = librarians;
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
            this.periodsFetchSubscription,
            this.librariansSubscription,
            this.librariansFetchSubscription
        ]);
    }
}
