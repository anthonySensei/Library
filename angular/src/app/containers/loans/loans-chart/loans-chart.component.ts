import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { LoansService } from '../../../services/loans.service';

import { Statistic } from '../../../models/statistic.model';

import { WarnMessages } from '../../../constants/warnMessages';
import { PageTitles } from '../../../constants/pageTitles';
import { Department } from '../../../models/department.model';
import { FiltersName } from '../../../constants/filtersName';
import { MaterialService } from '../../../services/material.service';
import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { Select, Store } from '@ngxs/store';
import { User } from '../../../models/user.model';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { UserState } from '../../../store/state/user.state';
import { BookState, LoadSummaryStatistic } from '../../../store/state/book.state';
import { SummaryStatistic } from '../../../models/request/loan';

@Component({
    selector: 'app-loans-chart',
    templateUrl: './loans-chart.component.html',
    styleUrls: ['./loans-chart.component.scss']
})
export class LoansChartComponent implements OnInit, OnDestroy {
    statistic: Statistic[];

    isManager: boolean;

    view: any[] = [700, 300];
    view2: any[] = [200, 400];

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
        domain: ['#FFDF6C']
    };
    colorScheme2 = {
        domain: ['#FFFFFF', '#FFDF6C', '#C30415']
    };
    cardColor = '#202020';

    summaryStatistic = [];

    @Select(UserState.User)
    user$: Observable<User>;

    @Select(BookState.SummaryStatistic)
    summaryStatistic$: Observable<SummaryStatistic>;

    constructor(
        private loansService: LoansService,
        private materialService: MaterialService,
        private store: Store,
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.STATISTIC;
        this.loadSummaryStatistic();
        this.getUser$();
        this.getSummaryStatistic$();
    }

    isChartEmpty(): boolean {
        return !this.multi?.length || !this.multi[0]?.seriesArr?.length;
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.isManager = user && user.admin);
    }

    getSummaryStatistic$() {
        this.summaryStatistic$.pipe(untilDestroyed(this)).subscribe(summaryStatistic => {
            const { totalBooks, loansForLastMonth, totalDebtors } = summaryStatistic || {} as SummaryStatistic;
            this.summaryStatistic = [
                { name: 'Total books', value: totalBooks },
                { name: 'Loans last month', value: loansForLastMonth },
                { name: 'Debtors', value: totalDebtors },
            ];
        });
    }

    loadSummaryStatistic() {
        this.store.dispatch(new LoadSummaryStatistic());
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
                    // @ts-ignore
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
            this.materialService.openSnackbar(
                WarnMessages.EMPTY_STATISTIC,
                SnackBarClasses.Warn
            );
        }
    }

    getInputName(): string {
        switch (this.model) {
            default:
                return FiltersName.NOTHING;
        }
    }

    getLegendName(): string {
        switch (this.model) {
            default:
                return FiltersName.NOTHING;
        }
    }

    showStatistic(): void {
        this.loansService.fetchLoansStatisticHttp(this.model, this.modelValue).pipe(untilDestroyed(this)).subscribe();
        this.statisticHandler();
    }

    ngOnDestroy(): void {}
}
