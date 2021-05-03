import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Store } from '@ngxs/store';
import { EditImage } from '../../../../store/state/user.state';

@Component({
    selector: 'app-change-profile-image-dialog',
    templateUrl: './change-profile-image-modal.html'
})
export class ChangeProfileImageModalComponent {
    imageChangedEvent: any = '';
    image: string;

    constructor(
        public dialogRef: MatDialogRef<ChangeProfileImageModalComponent>,
        private store: Store
    ) {}

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }

    imageCropped(event: ImageCroppedEvent): void {
        this.image = event.base64;
    }

    onChangeImage() {
        this.store.dispatch(new EditImage(this.image)).subscribe(() => this.dialogRef.close());
    }
}
