import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-read-popup',
  templateUrl: './read-popup.component.html',
  styleUrls: ['./read-popup.component.scss']
})
export class ReadPopupComponent {

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: string
    ) { }
}
