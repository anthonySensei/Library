import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';

import { Subscription } from 'rxjs';

import { LibrarianService } from '../../../services/librarian.service';
import { HelperService } from '../../../services/helper.service';

import { Loan } from '../../../models/loan.model';
import { Librarian } from '../../../models/librarian.model';
import { Schedule } from '../../../models/schedule.model';
import { Statistic } from '../../../models/statistic.model';
import { Department } from '../../../models/department.model';
import { DepartmentService } from '../../../services/department.service';

@Component({
    selector: 'app-librarian-details',
    templateUrl: './librarian-details.component.html',
    styleUrls: ['./librarian-details.component.sass']
})
export class LibrarianDetailsComponent implements OnInit, OnDestroy {
    schedule: Schedule[];
    departments: Department[];

    librarian: Librarian;
    librarianId: number;

    librarianSubscription: Subscription;
    librarianChangedSubscription: Subscription;
    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;

    paramsSubscription: Subscription;

    isLoading: boolean;

    displayedScheduleColumns: string[] = ['day', 'start', 'end'];

    scheduleDataSource: MatTableDataSource<{}>;
    @ViewChild(MatSort, { static: true }) scheduleSort: MatSort;

    showLabels = true;
    animations = true;
    xAxis = true;
    yAxis = true;
    showYAxisLabel = true;
    showXAxisLabel = true;
    xAxisLabel = 'Date';
    yAxisLabel = 'Quantity of books';
    timeline = true;

    model: string;
    modelValue: string;

    colorScheme = {
        domain: ['#ffaa00']
    };

    view: any[] = [700, 300];

    multi: any;

    constructor(
        private librarianService: LibrarianService,
        private helperService: HelperService,
        private departmentService: DepartmentService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        document.title = 'Librarian';
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.librarianId = +params.id;
                this.librarianSubscriptionHandle();
            }
        );
    }

    librarianSubscriptionHandle(): void {
        this.librarianSubscription = this.librarianService
            .getLibrarianHttp(this.librarianId)
            .subscribe();
        this.librarianChangedSubscription = this.librarianService
            .getLibrarian()
            .subscribe(librarian => {
                this.librarian = librarian;
                this.schedule = this.librarian.schedule || [];
                this.scheduleDataSource = new MatTableDataSource(this.schedule);
                this.scheduleDataSource.sort = this.scheduleSort;
                this.setStatisticToChart(this.librarian.statistic);
                this.isLoading = false;
            });
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
            });
    }

    setStatisticToChart(statistic: Statistic[]): void {
        const seriesArr = [];
        statistic.forEach((stat: Statistic) => {
            const item = {
                name: stat.loanTime,
                value: stat.books
            };
            seriesArr.push(item);
        });
        if (seriesArr.length > 0) {
            this.multi = [
                {
                    name: this.librarian.name,
                    series: seriesArr
                }
            ];
        } else {
            this.xAxisLabel = '';
            this.multi = this.helperService.emptyChartHandle(
                this.librarian.name
            );
        }
    }

    onSelect(data): void {}

    onActivate(data): void {}

    onDeactivate(data): void {}

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.paramsSubscription, [
            this.librarianChangedSubscription,
            this.librarianSubscription,
            this.departmentsFetchSubscription,
            this.departmentsSubscription
        ]);
    }
}
