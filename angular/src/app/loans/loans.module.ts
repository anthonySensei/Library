import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { LineChartModule } from '@swimlane/ngx-charts';

import { SharedModule } from '../shared/shared.module';
import { LoansRoutingModule } from './loans-routing.module';

import { LoansPageComponent } from './components/loans-page/loans-page.component';
import { LoansChartComponent } from './components/loans-chart/loans-chart.component';
import { MatPaginatorModule, MatSortModule } from '@angular/material';

@NgModule({
    declarations: [LoansPageComponent, LoansChartComponent],
    imports: [
        RouterModule,
        LoansRoutingModule,
        SharedModule,
        FormsModule,
        LineChartModule,
        MatPaginatorModule,
        MatSortModule
    ],
    entryComponents: []
})
export class LoansModule {}
