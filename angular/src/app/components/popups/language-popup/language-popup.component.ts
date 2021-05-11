import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { StoreStateModel } from '../../../store/models/store.model';
import { Language } from '../../../models/language.model';
import { CreateLanguage, EditLanguage } from '../../../store/state/language.state';

@Component({
  selector: 'app-language-popup',
  templateUrl: './language-popup.component.html',
  styleUrls: ['./language-popup.component.scss']
})
export class LanguagePopupComponent implements OnInit {
  isEdit: boolean;
  form: FormGroup;

  constructor(
      private store: Store,
      public dialogRef: MatDialogRef<LanguagePopupComponent>,
      @Inject(MAT_DIALOG_DATA) public data: Language
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.id;
    this.initForm();
  }

  initForm() {
    const { code, englishTitle, englishCountry } = this.data;
    this.form = new FormGroup({
      englishTitle: new FormControl(englishTitle || '', [Validators.required]),
      englishCountry: new FormControl(englishCountry || '', [Validators.required]),
      code: new FormControl(code || '', [Validators.required])
    });
  }

  isInvalid(): boolean {
    return this.form.invalid;
  }

  getTitle(): string {
    return this.isEdit ? `Edit Language` : `Add Language`;
  }

  addLanguage(): Observable<StoreStateModel> {
    const { englishTitle, code, englishCountry } = this.form.value;
    return this.store.dispatch(new CreateLanguage({ englishTitle, code, englishCountry }));
  }

  editLanguage(): Observable<StoreStateModel> {
    const { englishTitle, code, englishCountry } = this.form.value;
    return this.store.dispatch(new EditLanguage(this.data.id, { englishTitle, code, englishCountry }));
  }

  onDoAction() {
    if (this.isInvalid()) {
      return;
    }

    (this.isEdit ? this.editLanguage() : this.addLanguage()).subscribe(() => this.onClose());
  }

  onClose() {
    this.dialogRef.close();
  }
}
