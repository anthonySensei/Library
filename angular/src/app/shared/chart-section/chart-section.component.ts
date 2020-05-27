import { Component, Input, OnInit } from '@angular/core';

import { Statistic } from '../../models/statistic.model';

import { HelperService } from '../../services/helper.service';

@Component({
    selector: 'app-chart-section',
    templateUrl: './chart-section.component.html'
})
export class ChartSectionComponent implements OnInit {
    @Input() statistic: Statistic[];
    @Input() helperService: HelperService;
    @Input() name: string;

    showLabels = true;
    animations = true;
    xAxis = true;
    yAxis = true;
    showYAxisLabel = true;
    showXAxisLabel = true;
    xAxisLabel = 'Date';
    yAxisLabel = 'Quantity of books';
    timeline = true;

    colorScheme = {
        domain: ['#ffaa00']
    };

    view: any[] = [700, 300];

    multi: any;

    constructor() {}

    ngOnInit() {
        this.setStatisticToChart();
    }

    setStatisticToChart(): void {
        const seriesArr = [];
        this.statistic.forEach((stat: Statistic) => {
            const item = {
                name: stat.loanTime,
                value: stat.books
            };
            seriesArr.push(item);
        });
        if (seriesArr.length > 0) {
            this.multi = [
                {
                    name: this.name,
                    series: seriesArr
                }
            ];
        } else {
            this.xAxisLabel = '';
            this.multi = this.helperService.emptyChartHandle(this.name);
        }
    }

    onSelect(data): void {}

    onActivate(data): void {}

    onDeactivate(data): void {}
}
