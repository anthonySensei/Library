import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Book } from '../../../models/book.model';
import { Select, Store } from '@ngxs/store';
import { MatStepper } from '@angular/material/stepper';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { Observable } from 'rxjs';
import { AuthorState } from '../../../store/state/author.state';
import { Author } from '../../../models/author.model';
import { AuthorPopupComponent } from '../author-popup/author-popup.component';
import { GenreState } from '../../../store/state/genre.state';
import { Genre } from '../../../models/genre.model';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { CreateBook, EditBook } from '../../../store/state/book.state';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { LocalizationState } from '../../../store/state/localization.state';
import { Country } from '../../../models/country.model';
import { Language } from '../../../models/language.model';
import { map, startWith } from 'rxjs/operators';
import { LocalizationService } from '../../../services/localization.service';
import { StoreStateModel } from '../../../store/models/store.model';
import { GenrePopupComponent } from '../genre-popup/genre-popup.component';

@Component({
    selector: 'app-book-popup',
    templateUrl: './book-popup.component.html',
    styleUrls: ['./book-popup.component.scss']
})
export class BookPopupComponent implements OnInit, OnDestroy {

    isEdit: boolean;
    isEbook: boolean;
    image: string;
    linkToFile: string;

    mainForm: FormGroup;
    detailsForm: FormGroup;
    quantity = new FormControl(null, [Validators.required, Validators.max(420)]);

    bookFile: File;
    imageFile: Event;
    isbnValidation: RegExp;

    languages: Language[];
    filteredLanguages: Observable<Language[]>;
    @ViewChild('stepper') stepper: MatStepper;

    @Select(GenreState.Genres)
    genres$: Observable<Genre[]>;

    constructor(
        private store: Store,
        private dialog: MatDialog,
        public validationService: ValidationService,
        public localizationService: LocalizationService,
        public dialogRef: MatDialogRef<BookPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Book
    ) {}

    get languageControl(): AbstractControl {
        return this.mainForm?.controls?.language;
    }

    get authorsControl(): AbstractControl {
        return this.detailsForm?.controls?.authors;
    }

    get genresControl(): AbstractControl {
        return this.detailsForm?.controls?.genres;
    }

    ngOnInit(): void {
        this.isEdit = !!this.data._id;
        this.isbnValidation = this.validationService.getIsbnValidation();
        this.languages = this.store.selectSnapshot(LocalizationState.Languages);
        this.initForms();
    }

    initForms() {
        const { isbn, title, quantity, language, ebook, file } = this.data;
        const { description, authors, genres, year, image } = this.data;
        this.quantity.patchValue(quantity);
        this.image = image;
        this.isEbook = ebook;
        this.linkToFile = file as string;
        this.mainForm = new FormGroup({
            isbn: new FormControl(isbn || null, [Validators.required, Validators.pattern(this.isbnValidation)]),
            title: new FormControl(title || null, [Validators.required]),
            language: new FormControl(this.localizationService.getLanguage(language), [Validators.required])
        });
        this.detailsForm = new FormGroup({
            description: new FormControl(description || null, [Validators.required]),
            authors: new FormControl({ value: this.getAuthorsIds(authors) || null, disabled: !language }, [Validators.required]),
            genres: new FormControl(this.getGenresIds(genres) || null, [Validators.required]),
            year: new FormControl(year || null, [Validators.required])
        });
        this.languageControl.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
            value ? this.authorsControl.enable() : this.authorsControl.disable();
        });
        this.authorsControl.valueChanges.pipe(untilDestroyed(this)).subscribe(value => this.removeAddOption(value));
        this.genresControl.valueChanges.pipe(untilDestroyed(this)).subscribe(value => this.removeAddOption(value, true));
        this.filteredLanguages = this.languageControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterLanguages(value))
            );
    }

    hasError(controlName: string, errorName: string): boolean {
        if (this.mainForm.controls[controlName]) {
            return this.mainForm.controls[controlName].hasError(errorName);
        }

        return this.detailsForm.controls[controlName].hasError(errorName);
    }

    isInvalid(): boolean {
        if (this.getStep() === 0) {
            return this.mainForm.invalid;
        }

        if (this.getStep() === 1) {
            return this.detailsForm.invalid;
        }

        if (this.getStep() === 2) {
            return !this.image || ( this.isEbook && !this.isEdit && !this.bookFile ) || (!this.isEbook && this.quantity.invalid);
        }

        return this.mainForm.invalid;
    }

    removeAddOption(values: string[], isGenre: boolean = false) {
        if (values?.length && values.includes('_add_')) {
            const v = [...values];
            const index = v.findIndex(a => a === '_add_');
            v.splice(index, 1);
            isGenre ? this.genresControl.patchValue(v) : this.authorsControl.patchValue(v);
        }
    }

    displayWith(obj?: Country | Language): string | undefined {
        return obj ? obj.name : undefined;
    }

    getImage(): string {
        return `url("${this.image || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'}")`;
    }

    getTitle(): string {
        return this.isEdit ? `Edit Book` : `Add Book`;
    }

    getStep(): number {
        return this.stepper?.selectedIndex;
    }

    getFilteredAuthors(): Author[] {
        const authors = this.store.selectSnapshot(AuthorState.Authors);
        return authors.filter(author => author.language === this.languageControl.value?.code);
    }

    getAuthorsForSummary(ids: string[]): string {
        const authors = this.store.selectSnapshot(AuthorState.Authors);
        return authors.filter(author => ids?.includes(author._id)).map(author => author.name).join(', ');
    }

    getGenres(ids: string[]): string {
        const genres = this.store.selectSnapshot(GenreState.Genres);
        return genres.filter(genre => ids?.includes(genre._id)).map(genre => genre.name.en).join(', ');
    }

    getCountryName(code: string): string {
        return this.localizationService.getCountryName(code);
    }

    getGenresIds(genres: Genre[]): string[] {
        return genres?.map(genre => genre?._id);
    }

    getAuthorsIds(authors: Author[]): string[] {
        return authors?.map(author => author?._id);
    }

    getBtnCancelTitle(): string {
        if ([1, 2, 3].includes(this.getStep())) {
            return 'Back';
        }

        return 'Cancel';
    }

    getBtnActionTitle(): string {
        if (this.getStep() === 3) {
            return 'Save';
        }

        return 'Next';
    }

    doAction(): Observable<StoreStateModel> {
        const { isbn, title, language } = this.mainForm.value;
        const { description, authors: authorsIds, genres: genresIds, year } = this.detailsForm.value;
        const book: Book = {
            isbn, title, quantity: this.quantity.value, description, image: this.image, language: language.code, ebook: this.isEbook,
            authors: authorsIds.map(id => ({ id })), genres: genresIds.map(id => ({ id })), year, file: this.bookFile
        };
        return this.store.dispatch(this.isEdit ? new EditBook(this.data._id, book) : new CreateBook(book));
    }

    onClose(): void {
        this.dialogRef.close();
    }

    onImageChanged(event: Event): void {
        this.imageFile = event;
    }

    onBookFileChanged(event): void {
        this.bookFile = event.target.files[0];
    }

    onImageCropped(event: ImageCroppedEvent): void {
        this.image = event.base64;
    }

    onCancelAction() {
        if ([1, 2, 3].includes(this.getStep())) {
            return this.stepper.previous();
        }

        this.dialogRef.close();
    }

    onDoAction() {
        if ([0, 1, 2].includes(this.getStep())) {
            return this.stepper.next();
        }

        this.doAction().subscribe(() => this.dialogRef.close());
    }

    onAddAuthors() {
        const { language } = this.mainForm.value;
        this.dialog.open(AuthorPopupComponent, { data: { language: language.code }, disableClose: true, width: '568px' });
    }

    onAddGenres() {
        this.dialog.open(GenrePopupComponent, { data: { }, disableClose: true, width: '568px' });
    }

    _filterLanguages(value: string | Language): Language[] {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase();

        return this.languages.filter(language => language.name.toLowerCase().includes(filterValue));
    }

    ngOnDestroy() {}
}
