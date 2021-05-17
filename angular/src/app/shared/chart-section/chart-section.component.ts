import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-chart-section',
    templateUrl: './chart-section.component.html'
})
export class ChartSectionComponent implements OnInit {
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
    }

    onSelect(data): void {}

    onActivate(data): void {}

    onDeactivate(data): void {}
}
