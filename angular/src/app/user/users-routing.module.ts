import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/guards/auth.guard';
import { ManagerGuard } from './guards/manager.guard';
import { LibrarianGuard } from './guards/librarian.guard';

import { UserComponent } from './components/profile/user.component';
import { AddLibrarianComponent } from './components/add-librarian/add-librarian.component';
import { StudentsComponent } from './components/students/students.component';
import { StudentDetailsComponent } from './components/student-details/student-details.component';
import { LibrarianScheduleComponent } from './components/librarian-schedule/librarian-schedule.component';

import { CanDeactivateGuard } from '../shared/services/can-deactivate-guard.service';

import { AngularLinks } from '../constants/angularLinks';
import { LibrariansComponent } from './components/librarians/librarians.component';
import { LibrarianDetailsComponent } from './components/librarian-details/librarian-details.component';
import { OrdersComponent } from './components/orders/orders.component';

const routes: Routes = [
    {
        path: AngularLinks.MY_ACCOUNT,
        canDeactivate: [CanDeactivateGuard],
        component: UserComponent,
        canActivate: [AuthGuard]
    },
    {
        path: AngularLinks.CREATE_USER,
        canDeactivate: [CanDeactivateGuard],
        component: AddLibrarianComponent,
        canActivate: [AuthGuard, ManagerGuard]
    },
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
        path: AngularLinks.LIBRARIANS,
        component: LibrariansComponent,
        canActivate: [AuthGuard, ManagerGuard]
    },
    {
        path: AngularLinks.LIBRARIANS + '/:id',
        component: LibrarianDetailsComponent,
        canActivate: [AuthGuard, ManagerGuard]
    },
    {
        path: AngularLinks.LIBRARIAN_SCHEDULE,
        component: LibrarianScheduleComponent,
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
export class UsersRoutingModule {}
