import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { LoansRoutingModule } from './loans-routing.module';

import { LoansPageComponent } from './loans-page/loans-page.component';
import { LoansChartComponent } from './loans-chart/loans-chart.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NumberCardModule, PieChartModule } from '@swimlane/ngx-charts';

@NgModule({
    declarations: [LoansPageComponent, LoansChartComponent],
    imports: [
        RouterModule,
        LoansRoutingModule,
        SharedModule,
        FormsModule,
        MatPaginatorModule,
        MatSortModule,
        PieChartModule,
        NumberCardModule
    ],
    entryComponents: []
})
export class LoansModule {}
