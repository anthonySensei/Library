import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/guards/auth.guard';
import { LibrarianGuard } from '../user/guards/librarian.guard';

import { LoansPageComponent } from './components/loans-page/loans-page.component';
import { angularLinks } from '../constants/angularLinks';
import { LoansChartComponent } from './components/loans-chart/loans-chart.component';

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
