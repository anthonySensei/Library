import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../guards/auth.guard';
import { LibrarianGuard } from '../../guards/librarian.guard';

import { LoansPageComponent } from './loans-page/loans-page.component';
import { AngularLinks } from '../../constants/angularLinks';
import { LoansChartComponent } from './loans-chart/loans-chart.component';

const routes: Routes = [
    {
        path: AngularLinks.LOANS,
        canActivate: [AuthGuard, LibrarianGuard],
        component: LoansPageComponent
    },
    {
        path: AngularLinks.LOANS_CHART,
        canActivate: [AuthGuard, LibrarianGuard],
        component: LoansChartComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoansRoutingModule {}
