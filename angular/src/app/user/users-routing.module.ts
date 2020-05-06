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

import { angularLinks } from '../constants/angularLinks';
import { LibrariansComponent } from './components/librarians/librarians.component';
import { LibrarianDetailsComponent } from './components/librarian-details/librarian-details.component';

const routes: Routes = [
    {
        path: angularLinks.MY_ACCOUNT,
        canDeactivate: [CanDeactivateGuard],
        component: UserComponent,
        canActivate: [AuthGuard]
    },
    {
        path: angularLinks.CREATE_USER,
        canDeactivate: [CanDeactivateGuard],
        component: AddLibrarianComponent,
        canActivate: [AuthGuard, ManagerGuard]
    },
    {
        path: angularLinks.STUDENTS,
        component: StudentsComponent,
        canActivate: [AuthGuard, LibrarianGuard]
    },
    {
        path: angularLinks.STUDENTS + '/:id',
        component: StudentDetailsComponent,
        canActivate: [AuthGuard, LibrarianGuard]
    },
    {
        path: angularLinks.LIBRARIANS,
        component: LibrariansComponent,
        canActivate: [AuthGuard, ManagerGuard]
    },
    {
        path: angularLinks.LIBRARIANS + '/:id',
        component: LibrarianDetailsComponent,
        canActivate: [AuthGuard, ManagerGuard]
    },
    {
        path: angularLinks.LIBRARIAN_SCHEDULE,
        component: LibrarianScheduleComponent,
        canActivate: [AuthGuard, LibrarianGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule {}
