import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Author } from '../../../models/author.model';
import { Store } from '@ngxs/store';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { StoreStateModel } from '../../../store/models/store.model';
import { CreateAuthor, EditAuthor } from '../../../store/state/author.state';
import { Country } from '../../../models/country.model';
import { ValidationService } from '../../../services/validation.service';
import { map, startWith } from 'rxjs/operators';
import { Language } from '../../../models/language.model';
import { LocalizationState } from '../../../store/state/localization.state';

@Component({
    selector: 'app-author-popup',
    templateUrl: './author-popup.component.html',
    styleUrls: ['./author-popup.component.scss']
})
export class AuthorPopupComponent implements OnInit {
    isEdit: boolean;
    isBookAdding: boolean;
    form: FormGroup;
    countries: Country[];
    filteredCountries: Observable<Country[]>;
    languages: Language[];
    filteredLanguages: Observable<Language[]>;

    constructor(
        private store: Store,
        public dialogRef: MatDialogRef<AuthorPopupComponent>,
        private validationService: ValidationService,
        @Inject(MAT_DIALOG_DATA) public data: Author
    ) {}

    ngOnInit(): void {
        this.isEdit = !!this.data._id;
        this.isBookAdding = !!(!this.data._id && this.data.language);
        this.countries = this.store.selectSnapshot(LocalizationState.Countries);
        this.languages = this.store.selectSnapshot(LocalizationState.Languages);
        this.initForm();
    }

    initForm() {
        const { name, country, language } = this.data;
        const { RequireMatch } = this.validationService;
        this.form = new FormGroup({
            name: new FormControl(name || '', [Validators.required]),
            country: new FormControl(this.getCountry(country) || '', [Validators.required, RequireMatch]),
            language: new FormControl(
                { value: this.getLanguage(language) || '', disabled: this.isBookAdding },
                [Validators.required, RequireMatch]
            ),
        });
        this.filteredCountries = this.form.controls.country.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterCountries(value))
            );
        this.filteredLanguages = this.form.controls.language.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterLanguages(value))
            );
    }

    isInvalid(): boolean {
        return this.form?.invalid;
    }

    getTitle(): string {
        return this.isEdit ? `Edit Author` : `Add Author`;
    }

    getCountry(code: string): Country | undefined {
        return this.countries.find(country => country.code.toLowerCase() === code?.toLowerCase());
    }

    getLanguage(code: string): Language | undefined {
        return this.languages.find(language => language.code.toLowerCase() === code?.toLowerCase());
    }

    displayWith(obj?: Country | Language): string | undefined {
        return obj ? obj.name : undefined;
    }

    addAuthor(): Observable<StoreStateModel> {
        const { name, country, language } = this.form.value;
        return this.store.dispatch(new CreateAuthor({ name, country: country.code, language: language.code }));
    }

    editAuthor(): Observable<StoreStateModel> {
        const { name, country, language } = this.form.value;
        return this.store.dispatch(new EditAuthor(this.data._id, { name, country: country.code, language: language.code }));
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

    private _filterCountries(value: string | Country): Country[] {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase();

        return this.countries.filter(country => country.name.toLowerCase().includes(filterValue));
    }

    private _filterLanguages(value: string | Language): Language[] {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase();

        return this.languages.filter(language => language.name.toLowerCase().includes(filterValue));
    }
}
