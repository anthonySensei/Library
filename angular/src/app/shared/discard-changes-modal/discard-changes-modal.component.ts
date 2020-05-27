import { Component } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-discard-changes',
    templateUrl: './discard-changes-modal.html',
    styleUrls: ['./discard-changes-modal.sass']
})
export class DiscardChangesModalComponent {
    constructor(
        public dialogRef: MatDialogRef<DiscardChangesModalComponent>
    ) {
        dialogRef.disableClose = true;
    }
}
