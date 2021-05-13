import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainPageComponent } from './main-page/main-page.component';
import { BookDetailsComponent } from './book-details/book-details.component';

import { AngularLinks } from '../../constants/angularLinks';

const routes: Routes = [
    { path: AngularLinks.BOOKS, component: MainPageComponent },
    { path: `${AngularLinks.BOOKS}/:id`, component: BookDetailsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainPageRoutingModule {}
