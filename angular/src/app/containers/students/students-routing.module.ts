import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../guards/auth.guard';
import { LibrarianGuard } from '../../guards/librarian.guard';

import { StudentsComponent } from './students/students.component';
import { StudentDetailsComponent } from './student-details/student-details.component';
import { OrdersComponent } from './orders/orders.component';

import { CanDeactivateGuard } from '../../shared/can-deactivate-guard.service';

import { AngularLinks } from '../../constants/angularLinks';

const routes: Routes = [
    {
        path: AngularLinks.STUDENTS,
        component: StudentsComponent,
        canActivate: [AuthGuard, LibrarianGuard]
    },
    {
        path: AngularLinks.STUDENTS + '/:id',
        component: StudentDetailsComponent,
        canActivate: [AuthGuard, LibrarianGuard]
    },
    {
        path: AngularLinks.ORDERS,
        component: OrdersComponent,
        canActivate: [AuthGuard, LibrarianGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StudentsRoutingModule {}
