import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorPageComponent } from './error-page/error-page.component';
import { angularLinks } from './constants/angularLinks';

const routes: Routes = [
    {
        path: angularLinks.HOME,
        redirectTo: angularLinks.BOOKS,
        pathMatch: 'full'
    },
    { path: '**', component: ErrorPageComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
