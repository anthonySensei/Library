import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { LoansService } from '../../../services/loans.service';

import { Statistic } from '../../../models/statistic.model';

@Component({
    selector: 'app-loans-chart',
    templateUrl: './loans-chart.component.html',
    styleUrls: ['./loans-chart.component.sass']
})
export class LoansChartComponent implements OnInit, OnDestroy {
    statistic: Statistic[];

    statisticSubscription: Subscription;
    statisticTopFiveSubscription: Subscription;
    statisticChangedSubscription: Subscription;

    view: any[] = [700, 300];

    multi: any = [
        {
            name: 'Empty',
            series: [
                {
                    name: 'Empty',
                    value: 0
                }
            ]
        }
    ];

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
        domain: ['#ffaa00', '#5AA454', '#E44D25', '#7aa3e5', '#a8385d']
    };
    constructor(private loansService: LoansService) {}

    ngOnInit() {
        document.title = 'Statistic';
        this.statisticHandler();
    }

    statisticHandler() {
        this.statisticChangedSubscription = this.loansService.statisticChanged.subscribe(
            statistic => {
                this.statistic = statistic;
                const seriesArr = [];
                for (const stat of this.statistic) {
                    const item = {
                        name: stat.loanTime,
                        value: stat.books
                    };
                    seriesArr.push(item);
                }
                this.multi = [
                    {
                        name:
                            this.model === 'user'
                                ? this.statistic[0].student.name
                                : this.statistic[0].book.name,
                        series: seriesArr
                    }
                ];
            }
        );
        this.statistic = this.loansService.getStatistic();
    }

    onSelect(data): void {}

    onActivate(data): void {}

    onDeactivate(data): void {}

    showStatistic() {
        this.statisticSubscription = this.loansService
            .fetchLoansStatisticHttp(this.model, this.modelValue)
            .subscribe();
    }

    showTopFive() {
        this.statisticTopFiveSubscription = this.loansService
            .fetchTopFiveLoansHttp(this.model)
            .subscribe();
    }

    ngOnDestroy(): void {
        if (this.statisticSubscription) {
            this.statisticSubscription.unsubscribe();
        }
        if (this.statisticTopFiveSubscription) {
            this.statisticTopFiveSubscription.unsubscribe();
        }
        this.statisticChangedSubscription.unsubscribe();
    }
}
