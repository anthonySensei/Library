import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorPageComponent } from './components/error-page/error-page.component';
import { EditPageComponent } from './components/edit-page/edit-page.component';

import { AngularLinks } from './constants/angularLinks';

import { AuthGuard } from './guards/auth.guard';
import { LibrarianGuard } from './guards/librarian.guard';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
    {
        path: AngularLinks.HOME,
        component: HomeComponent,
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
