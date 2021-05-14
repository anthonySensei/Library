import { Component } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { LoadBook, LoanBook } from '../../../../store/state/book.state';

@Component({
    selector: 'app-loan-book-modal',
    templateUrl: './loan-book-popup.component.html',
    styleUrls: ['../../main-page/main-page.component.scss']
})
export class LoanBookPopupComponent {
    credentials: string;

    constructor(
        public dialogRef: MatDialogRef<LoanBookPopupComponent>,
        public store: Store
    ) {}

    onLoanBook() {
        this.store.dispatch(new LoanBook(this.credentials)).subscribe(() => this.onClose());
    }

    onClose() {
        this.dialogRef.close();
    }
}
