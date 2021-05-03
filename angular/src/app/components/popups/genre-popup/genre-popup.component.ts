import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Genre } from '../../../models/genre.model';
import { Observable } from 'rxjs';
import { StoreStateModel } from '../../../store/models/store.model';
import { CreateGenre, EditGenre } from '../../../store/state/genre.state';

@Component({
  selector: 'app-genre-popup',
  templateUrl: './genre-popup.component.html',
  styleUrls: ['./genre-popup.component.scss']
})
export class GenrePopupComponent implements OnInit {
  isEdit: boolean;
  name = new FormControl(null, Validators.required);

  constructor(
      private store: Store,
      public dialogRef: MatDialogRef<GenrePopupComponent>,
      @Inject(MAT_DIALOG_DATA) public data: Genre
  ) { }

  ngOnInit(): void {
    this.isEdit = !!this.data.id;
    this.name.patchValue(this.data.name);
  }

  isInvalid(): boolean {
    return this.name.invalid;
  }

  getTitle(): string {
    return this.isEdit ? `Edit Genre` : `Add Genre`;
  }

  addGenre(): Observable<StoreStateModel> {
    return this.store.dispatch(new CreateGenre(this.name.value));
  }

  editGenre(): Observable<StoreStateModel> {
    return this.store.dispatch(new EditGenre(this.data.id, this.name.value));
  }

  onDoAction() {
    if (this.isInvalid()) {
      return;
    }

    (this.isEdit ? this.editGenre() : this.addGenre()).subscribe(() => this.onClose());
  }

  onClose() {
    this.dialogRef.close();
  }
}
