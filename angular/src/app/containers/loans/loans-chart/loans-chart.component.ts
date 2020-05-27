import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { LoansService } from '../../../services/loans.service';
import { HelperService } from '../../../services/helper.service';

import { Statistic } from '../../../models/statistic.model';

import { WarnMessages } from '../../../constants/warnMessages';
import { PageTitles } from '../../../constants/pageTitles';
import { DbModels } from '../../../constants/dbModels';
import { DepartmentService } from '../../../services/department.service';
import { Department } from '../../../models/department.model';
import { FiltersName } from '../../../constants/filtersName';
import { MaterialService } from '../../../services/material.service';
import { SnackBarClasses } from '../../../constants/snackBarClasses';

@Component({
    selector: 'app-loans-chart',
    templateUrl: './loans-chart.component.html',
    styleUrls: ['./loans-chart.component.sass']
})
export class LoansChartComponent implements OnInit, OnDestroy {
    statistic: Statistic[];
    departments: Department[];

    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    statisticSubscription: Subscription;
    statisticChangedSubscription: Subscription;

    view: any[] = [700, 300];

    multi: any;

    legend = true;
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
    constructor(
        private loansService: LoansService,
        private helperService: HelperService,
        private materialService: MaterialService,
        private departmentService: DepartmentService
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.STATISTIC;
        this.multi = this.helperService.emptyChartHandle(WarnMessages.EMPTY);
        this.subscriptionHandle();
    }

    statisticHandler(): void {
        this.statisticChangedSubscription = this.loansService
            .getStatistic()
            .subscribe((statistic: Statistic[]) => {
                this.statistic = statistic;
                this.setStatisticToChart();
            });
    }

    setStatisticToChart() {
        const seriesArr = [];
        if (this.statistic.length > 0) {
            this.statistic.forEach((stat: Statistic) => {
                const item = {
                    name: stat.loanTime,
                    value: stat.books
                };
                seriesArr.push(item);
            });
            this.multi = [
                {
                    name: this.getLegendName(),
                    series: seriesArr
                }
            ];
        } else {
            this.multi = this.helperService.emptyChartHandle(
                WarnMessages.EMPTY
            );
            this.materialService.openSnackbar(
                WarnMessages.EMPTY_STATISTIC,
                SnackBarClasses.Warn
            );
        }
    }

    getInputName(): string {
        switch (this.model) {
            case DbModels.USER:
                return FiltersName.READER_TICKET;
            case DbModels.LIBRARIAN:
                return FiltersName.EMAIL;
            case DbModels.BOOK:
                return FiltersName.ISBN;
            case DbModels.DEPARTMENT:
                return FiltersName.ADDRESS;
            default:
                return FiltersName.NOTHING;
        }
    }

    getLegendName(): string {
        switch (this.model) {
            case DbModels.USER:
                return this.statistic[0].student.name;
            case DbModels.LIBRARIAN:
                return this.statistic[0].librarian.name;
            case DbModels.BOOK:
                return this.statistic[0].book.name;
            case DbModels.DEPARTMENT:
                return this.statistic[0].department.address;
            default:
                return FiltersName.NOTHING;
        }
    }

    onSelect(data): void {}

    onActivate(data): void {}

    onDeactivate(data): void {}

    showStatistic(): void {
        this.statisticSubscription = this.loansService
            .fetchLoansStatisticHttp(this.model, this.modelValue)
            .subscribe();
        this.statisticHandler();
    }

    subscriptionHandle(): void {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
            });
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.departmentsSubscription, [
            this.departmentsFetchSubscription,
            this.statisticSubscription,
            this.statisticChangedSubscription
        ]);
    }
}
