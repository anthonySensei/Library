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
import { untilDestroyed } from 'ngx-take-until-destroy';

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

    departmentSelect: number;

    nothingToChange = WarnMessages.NOTHING_TO_CHANGE;
    isManager: boolean;

    constructor(
        public departmentService: DepartmentService,
        private authService: AuthService,
        public responseService: ResponseService,
        private materialService: MaterialService,
        private periodService: PeriodService,
        public helperService: HelperService,
        public librarianService: LibrarianService,
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.MANAGING;
        this.selectsValuesSubscriptionHandle();
        this.authService.isManager().then((isManager: boolean) => {
            this.isManager = isManager;
        });
    }

    selectsValuesSubscriptionHandle(): void {
        this.departmentService.fetchAllDepartmentsHttp().pipe(untilDestroyed(this)).subscribe();
        this.departmentService.getDepartments().pipe(untilDestroyed(this)).subscribe((departments: Department[]) => {
            this.departments = departments;
        });
        this.periodService.fetchAllPeriodsHttp().pipe(untilDestroyed(this)).subscribe();
        this.periodService.getPeriods().pipe(untilDestroyed(this)).subscribe((periods: Period[]) => {
            this.periods = periods;
        });
        this.onSetLibrarians();
    }

    onSetLibrarians(): void {
        this.librarianService.getAllLibrariansHttp().pipe(untilDestroyed(this)).subscribe();
        this.librarianService.getLibrarians().pipe(untilDestroyed(this)).subscribe((librarians: Librarian[]) => {
            this.librarians = librarians;
        });
    }

    nothingChangeHandle(): void {
        this.materialService.openSnackbar(this.nothingToChange, SnackBarClasses.Warn);
    }

    ngOnDestroy(): void {}
}
