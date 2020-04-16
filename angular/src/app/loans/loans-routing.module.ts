import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';
import { LibrarianGuard } from '../user/librarian.guard';

import { LoansPageComponent } from './loans-page/loans-page.component';
import { angularLinks } from '../constants/angularLinks';
import { LoansChartComponent } from './loans-chart/loans-chart.component';

const routes: Routes = [
    {
        path: angularLinks.LOANS,
        canActivate: [AuthGuard, LibrarianGuard],
        component: LoansPageComponent
    },
    {
        path: angularLinks.LOANS_CHART,
        canActivate: [AuthGuard, LibrarianGuard],
        component: LoansChartComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoansRoutingModule {}
