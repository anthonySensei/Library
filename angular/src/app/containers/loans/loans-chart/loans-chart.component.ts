import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { LoansService } from '../../../services/loans.service';
import { HelperService } from '../../../services/helper.service';

import { Statistic } from '../../../models/statistic.model';

import { WarnMessages } from '../../../constants/warnMessages';
import { PageTitles } from '../../../constants/pageTitles';
import { DbModels } from '../../../constants/dbModels';
import { Department } from '../../../models/department.model';
import { FiltersName } from '../../../constants/filtersName';
import { MaterialService } from '../../../services/material.service';
import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { AuthService } from '../../../services/auth.service';
import { Select } from '@ngxs/store';
import { UserState } from '../../../store/state/user.state';
import { User } from '../../../models/user.model';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-loans-chart',
    templateUrl: './loans-chart.component.html',
    styleUrls: ['./loans-chart.component.sass']
})
export class LoansChartComponent implements OnInit, OnDestroy {
    statistic: Statistic[];
    departments: Department[];

    isManager: boolean;

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

    @Select(UserState.User)
    user$: Observable<User>;

    constructor(
        private loansService: LoansService,
        private helperService: HelperService,
        private materialService: MaterialService,
        private authService: AuthService,
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.STATISTIC;
        this.multi = this.helperService.emptyChartHandle(WarnMessages.EMPTY);
        this.getUser$();
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.isManager = user && user.admin);
    }

    statisticHandler(): void {
        this.loansService.getStatistic().pipe(untilDestroyed(this)).subscribe((statistic: Statistic[]) => {
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
            this.multi = this.helperService.emptyChartHandle(WarnMessages.EMPTY);
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
                return this.statistic[0].book.title;
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
        this.loansService.fetchLoansStatisticHttp(this.model, this.modelValue).pipe(untilDestroyed(this)).subscribe();
        this.statisticHandler();
    }

    ngOnDestroy(): void {}
}
