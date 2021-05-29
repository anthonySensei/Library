import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { BookState } from '../../store/state/book.state';
import { Observable } from 'rxjs';
import { Statistic } from '../../models/request/loan';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-chart-section',
    templateUrl: './chart-section.component.html',
    styleUrls: ['./chart-section.component.scss']
})
export class ChartSectionComponent implements OnInit, OnDestroy {

    showLabels = true;
    animations = true;
    xAxis = true;
    yAxis = true;
    showYAxisLabel = true;
    showXAxisLabel = true;
    xAxisLabel = 'Date';
    yAxisLabel = 'Quantity of books';
    timeline = true;

    colorScheme = {  domain: ['#FFDF6C']  };

    view: any[] = [700, 300];

    statistic = [];

    @Input() name: string;
    @Input() legend: boolean;

    @Select(BookState.Statistic)
    statistic$: Observable<Statistic>;

    constructor() {}

    ngOnInit() {
        this.getStatistic$();
    }

    isChartEmpty(): boolean {
        return !this.statistic[0]?.series?.length;
    }

    getStatistic$(): void {
        this.statistic$.pipe(untilDestroyed(this)).subscribe(stat => this.statistic = [{ name: this.name, series: stat }]);
    }

    ngOnDestroy() {}
}
