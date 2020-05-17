import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorPageComponent } from './error-page/error-page.component';
import { EditPageComponent } from './edit-page/edit-page.component';

import { AngularLinks } from './constants/angularLinks';

import { CanDeactivateGuard } from './shared/services/can-deactivate-guard.service';

import { AuthGuard } from './auth/guards/auth.guard';
import { LibrarianGuard } from './user/guards/librarian.guard';

const routes: Routes = [
    {
        path: AngularLinks.HOME,
        redirectTo: AngularLinks.BOOKS,
        pathMatch: 'full'
    },
    {
        path: AngularLinks.EDIT_PAGE,
        component: EditPageComponent,
        canActivate: [AuthGuard, LibrarianGuard]
    },
    { path: '**', component: ErrorPageComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
