import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainPageComponent } from './main-page/main-page.component';
import { BookDetailsComponent } from './book-details/book-details.component';
import { AddBookComponent } from './add-book/add-book.component';

import { AuthGuard } from '../../guards/auth.guard';

import { CanDeactivateGuard } from '../../shared/can-deactivate-guard.service';

import { AngularLinks } from '../../constants/angularLinks';

const routes: Routes = [
    { path: AngularLinks.BOOKS, component: MainPageComponent },
    { path: `${AngularLinks.BOOKS}/:id`, component: BookDetailsComponent },
    {
        path: AngularLinks.ADD_BOOK,
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard],
        component: AddBookComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainPageRoutingModule {}
