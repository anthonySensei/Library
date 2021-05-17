import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { PageTitles } from '../../../constants/pageTitles';
import { FiltersName } from '../../../constants/filtersName';
import { MaterialService } from '../../../services/material.service';
import { Select, Store } from '@ngxs/store';
import { User } from '../../../models/user.model';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { UserState } from '../../../store/state/user.state';
import { BookState, LoadStatistic, LoadSummaryStatistic } from '../../../store/state/book.state';
import { Statistic, SummaryStatistic } from '../../../models/request/loan';
import { models } from '../../../constants/models';

@Component({
    selector: 'app-loans-chart',
    templateUrl: './loans-chart.component.html',
    styleUrls: ['./loans-chart.component.scss']
})
export class LoansChartComponent implements OnInit, OnDestroy {
    isManager: boolean;

    view: any[] = [700, 300];
    view2: any[] = [200, 400];


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
    value: string;

    colorScheme = {
        domain: ['#FFDF6C']
    };
    colorScheme2 = {
        domain: ['#FFFFFF', '#FFDF6C', '#C30415']
    };
    cardColor = '#202020';

    statistic = [];
    summaryStatistic = [];

    @Select(UserState.User)
    user$: Observable<User>;

    @Select(BookState.Statistic)
    statistic$: Observable<Statistic>;

    @Select(BookState.SummaryStatistic)
    summaryStatistic$: Observable<SummaryStatistic>;

    constructor(
        private materialService: MaterialService,
        private store: Store,
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.STATISTIC;
        this.loadSummaryStatistic();
        this.getUser$();
        this.getStatistic$();
        this.getSummaryStatistic$();
    }

    isChartEmpty(): boolean {
        return !this.statistic[0]?.series?.length;
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.isManager = user && user.admin);
    }

    getStatistic$(): void {
        this.statistic$.pipe(untilDestroyed(this)).subscribe(stat => this.statistic = [{ name: this.value, series: stat }]);
    }

    getSummaryStatistic$(): void {
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

    getInputName(): string {
        switch (this.model) {
            case models.USER:
                return FiltersName.EMAIL;
            case models.LIBRARIAN:
                return FiltersName.EMAIL;
            case models.BOOK:
                return FiltersName.ISBN;
            default:
                return FiltersName.NOTHING;
        }
    }

    onShowStatistic(): void {
        this.store.dispatch(new LoadStatistic(this.model, this.value));
    }

    ngOnDestroy(): void {}
}
