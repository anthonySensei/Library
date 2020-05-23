import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ImageCroppedEvent } from 'ngx-image-cropper';

import { DialogData } from '../add-book.component';

@Component({
    selector: 'app-dialog',
    templateUrl: './choose-image-modal.component.html'
})
export class ModalBookCreateDialogComponent {
    imageChangedEvent: any = '';
    croppedImage: any = '';

    constructor(
        public dialogRef: MatDialogRef<ModalBookCreateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        dialogRef.disableClose = true;
    }

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent): void {
        this.croppedImage = event.base64;
        this.data.imageBase64 = this.croppedImage;
    }
}
