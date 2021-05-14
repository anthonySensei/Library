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
import { Select } from '@ngxs/store';
import { User } from '../../../models/user.model';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { UserState } from '../../../store/state/user.state';

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
        private materialService: MaterialService,
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.STATISTIC;
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

    onSelect(): void {}

    onActivate(): void {}

    onDeactivate(): void {}

    showStatistic(): void {
        this.loansService.fetchLoansStatisticHttp(this.model, this.modelValue).pipe(untilDestroyed(this)).subscribe();
        this.statisticHandler();
    }

    ngOnDestroy(): void {}
}
