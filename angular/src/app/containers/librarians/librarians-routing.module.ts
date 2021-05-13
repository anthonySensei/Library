import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../guards/auth.guard';
import { ManagerGuard } from '../../guards/manager.guard';
import { LibrarianGuard } from '../../guards/librarian.guard';

import { AngularLinks } from '../../constants/angularLinks';

import { LibrariansComponent } from './librarians/librarians.component';
import { LibrarianDetailsComponent } from './librarian-details/librarian-details.component';
import { LibrarianScheduleComponent } from './librarian-schedule/librarian-schedule.component';

const routes: Routes = [
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
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LibrariansRoutingModule {}
