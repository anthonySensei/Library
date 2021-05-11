import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Author } from '../../../models/author.model';
import { Store } from '@ngxs/store';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { StoreStateModel } from '../../../store/models/store.model';
import { CreateAuthor, EditAuthor } from '../../../store/state/author.state';

@Component({
    selector: 'app-author-popup',
    templateUrl: './author-popup.component.html',
    styleUrls: ['./author-popup.component.scss']
})
export class AuthorPopupComponent implements OnInit {
    isEdit: boolean;
    form: FormGroup;

    constructor(
        private store: Store,
        public dialogRef: MatDialogRef<AuthorPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Author
    ) {}

    ngOnInit(): void {
        this.isEdit = !!this.data.id;
        this.initForm();
    }

    initForm() {
        const { name, country, language } = this.data;
        this.form = new FormGroup({
            name: new FormControl(name || '', [Validators.required]),
            country: new FormControl(country || '', [Validators.required]),
            language: new FormControl(language || '', [Validators.required]),
        });
    }

    isInvalid(): boolean {
        return this.form.invalid;
    }

    getTitle(): string {
        return this.isEdit ? `Edit Author` : `Add Author`;
    }

    addAuthor(): Observable<StoreStateModel> {
        const { name, country, language } = this.form.value;
        return this.store.dispatch(new CreateAuthor({ name, country, language }));
    }

    editAuthor(): Observable<StoreStateModel> {
        const { name, country, language } = this.form.value;
        return this.store.dispatch(new EditAuthor(this.data.id, { name, country, language }));
    }

    onDoAction() {
        if (this.isInvalid()) {
            return;
        }

        (this.isEdit ? this.editAuthor() : this.addAuthor()).subscribe(() => this.onClose());
    }

    onClose() {
        this.dialogRef.close();
    }
}
