import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { MainPageRoutingModule } from './main-page-routing.module';

import { MainPageComponent } from './main-page/main-page.component';
import { BookDetailsComponent } from './book-details/book-details.component';

import { LoanBookModalComponent } from './loan-book-modal/loan-book-modal.component';
import { AddBookComponent } from './add-book/add-book.component';
import { ModalBookCreateDialogComponent } from './add-book/choose-book-image-modal/choose-book-image-modal.component';
import { AddOptionModalComponent } from './add-book/add-option-modal/add-option-modal.component';

@NgModule({
    declarations: [
        MainPageComponent,
        BookDetailsComponent,
        AddBookComponent,
        ModalBookCreateDialogComponent,
        AddOptionModalComponent,
        LoanBookModalComponent
    ],
    imports: [RouterModule, MainPageRoutingModule, SharedModule, FormsModule],
    entryComponents: [
        ModalBookCreateDialogComponent,
        LoanBookModalComponent,
        AddOptionModalComponent
    ]
})
export class MainPageModule {}