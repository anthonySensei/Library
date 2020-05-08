import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorPageComponent } from './error-page/error-page.component';
import { AngularLinks } from './constants/angularLinks';

const routes: Routes = [
    {
        path: AngularLinks.HOME,
        redirectTo: AngularLinks.BOOKS,
        pathMatch: 'full'
    },
    { path: '**', component: ErrorPageComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
