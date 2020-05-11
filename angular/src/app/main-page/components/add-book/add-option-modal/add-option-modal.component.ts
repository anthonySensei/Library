import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AddOptionModalData } from './add-option-modal-data';

@Component({
    selector: 'app-add-option-dialog',
    templateUrl: './add-option-modal.component.html'
})
export class AddOptionModalComponent {
    constructor(
        public dialogRef: MatDialogRef<AddOptionModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AddOptionModalData
    ) {
        dialogRef.disableClose = true;
    }
}
