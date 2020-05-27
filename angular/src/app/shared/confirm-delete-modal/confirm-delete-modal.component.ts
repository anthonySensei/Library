import { Component } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-delete-modal',
    templateUrl: './confirm-delete-modal.component.html',
    styleUrls: ['../discard-changes-modal/discard-changes-modal.sass']
})
export class ConfirmDeleteModalComponent {
    constructor(public dialogRef: MatDialogRef<ConfirmDeleteModalComponent>) {
        dialogRef.disableClose = true;
    }
}
