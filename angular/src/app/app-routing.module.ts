import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorPageComponent } from './components/error-page/error-page.component';
import { EditPageComponent } from './components/edit-page/edit-page.component';

import { AngularLinks } from './constants/angularLinks';

import { CanDeactivateGuard } from './shared/can-deactivate-guard.service';

import { AuthGuard } from './guards/auth.guard';
import { LibrarianGuard } from './guards/librarian.guard';

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
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule {}
