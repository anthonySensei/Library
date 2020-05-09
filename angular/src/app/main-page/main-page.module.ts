import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { MainPageRoutingModule } from './main-page-routing.module';

import { MainPageComponent } from './components/main-page/main-page.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';
import { OrderRequestComponent } from './components/order-request/order-request.component';

import { LoanBookModalComponent } from './components/loan-book-modal/loan-book-modal.component';
import { AddBookComponent } from './components/add-book/add-book.component';
import { ModalBookCreateDialogComponent } from './components/add-book/choose-book-image-modal/choose-book-image-modal.component';
import { AddOptionModalComponent } from './components/add-book/add-option-modal/add-option-modal.component';

@NgModule({
    declarations: [
        MainPageComponent,
        BookDetailsComponent,
        AddBookComponent,
        OrderRequestComponent,
        ModalBookCreateDialogComponent,
        AddOptionModalComponent,
        LoanBookModalComponent
    ],
    imports: [RouterModule, MainPageRoutingModule, SharedModule, FormsModule],
    entryComponents: [ModalBookCreateDialogComponent, LoanBookModalComponent, AddOptionModalComponent]
})
export class MainPageModule {}
