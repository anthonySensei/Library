import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoanDialogDataModel } from './loan-book-modal-data.model';

@Component({
    selector: 'app-loan-book-modal',
    templateUrl: './loan-book-modal.html',
    styleUrls: ['../../main-page/main-page.component.scss']
})
export class LoanBookModalComponent {
    constructor(
        public dialogRef: MatDialogRef<LoanBookModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: LoanDialogDataModel
    ) {
        dialogRef.disableClose = true;
    }
}
