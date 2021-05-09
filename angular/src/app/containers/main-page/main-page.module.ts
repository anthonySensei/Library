import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';
import { MainPageRoutingModule } from './main-page-routing.module';

import { MainPageComponent } from './main-page/main-page.component';
import { BookDetailsComponent } from './book-details/book-details.component';

import { LoanBookModalComponent } from './book-details/loan-book-modal/loan-book-modal.component';
import { MoveBookModalComponent } from './book-details/move-book-modal/move-book-modal.component';
import { BooksListComponent } from './main-page/books-list/books-list.component';

@NgModule({
    declarations: [
        MainPageComponent,
        BookDetailsComponent,
        LoanBookModalComponent,
        MoveBookModalComponent,
        BooksListComponent
    ],
    imports: [RouterModule, MainPageRoutingModule, SharedModule, FormsModule],
    entryComponents: [
        LoanBookModalComponent,
        MoveBookModalComponent,
    ]
})
export class MainPageModule {}
