import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainPageComponent } from './main-page.component';
import { BookDetailsComponent } from './book-details/book-details.component';
import { AddBookComponent } from './create-book/add-book.component';
import { OrderRequestComponent } from './order-request/order-request.component';

import { AuthGuard } from '../auth/auth.guard';
import { LibrarianGuard } from '../user/librarian.guard';
import { CanDeactivateGuard } from '../shared/can-deactivate-guard.service';
import { angularLinks } from '../constants/angularLinks';

const routes: Routes = [
    { path: angularLinks.BOOKS, component: MainPageComponent },
    {
        path: angularLinks.ORDER_REQUESTS,
        canActivate: [AuthGuard, LibrarianGuard],
        component: OrderRequestComponent
    },
    { path: `${angularLinks.BOOKS}/:id`, component: BookDetailsComponent },
    {
        path: angularLinks.ADD_BOOK,
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
