import { Component } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-delete-modal',
    templateUrl: './are-you-sure.component.html',
    styleUrls: ['../discard-changes-modal/discard-changes-modal.sass']
})
export class AreYouSureComponent {
    constructor(public dialogRef: MatDialogRef<AreYouSureComponent>) {
        dialogRef.disableClose = true;
    }
}
