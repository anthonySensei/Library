import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Book } from '../../../models/book.model';
import { Select, Store } from '@ngxs/store';
import { MatStepper } from '@angular/material/stepper';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { DepartmentState } from '../../../store/state/department.state';
import { Observable } from 'rxjs';
import { Department } from '../../../models/department.model';
import { DepartmentPopupComponent } from '../department-popup/department-popup.component';
import { AuthorState } from '../../../store/state/author.state';
import { Author } from '../../../models/author.model';
import { AuthorPopupComponent } from '../author-popup/author-popup.component';
import { GenreState } from '../../../store/state/genre.state';
import { Genre } from '../../../models/genre.model';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { CreateBook } from '../../../store/state/book.state';

@Component({
    selector: 'app-book-popup',
    templateUrl: './book-popup.component.html',
    styleUrls: ['./book-popup.component.scss']
})
export class BookPopupComponent implements OnInit {

    image: string;
    file: Event;
    isEdit: boolean;
    mainForm: FormGroup;
    detailsForm: FormGroup;
    isbnValidation: RegExp;
    @ViewChild('stepper') stepper: MatStepper;

    @Select(AuthorState.Authors)
    authors$: Observable<Author[]>;

    @Select(GenreState.Genres)
    genres$: Observable<Genre[]>;

    @Select(DepartmentState.Departments)
    departments$: Observable<Department[]>;

    constructor(
        private store: Store,
        private dialog: MatDialog,
        public validationService: ValidationService,
        public dialogRef: MatDialogRef<BookPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Book
    ) {
    }

    ngOnInit(): void {
        this.isEdit = !!this.data.id;
        this.isbnValidation = this.validationService.getIsbnValidation();
        this.initForms();
    }

    initForms() {
        this.mainForm = new FormGroup({
            isbn: new FormControl(null, [Validators.required, Validators.pattern(this.isbnValidation)]),
            title: new FormControl(null, [Validators.required]),
            quantity: new FormControl(null, [Validators.required, Validators.max(420)]),
            department: new FormControl(null, [Validators.required])
        });
        this.detailsForm = new FormGroup({
            description: new FormControl(null, [Validators.required]),
            authors: new FormControl(null, [Validators.required]),
            genres: new FormControl(null, [Validators.required]),
            year: new FormControl(null, [Validators.required]),
            language: new FormControl(null, [Validators.required])
        });
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
            return !this.image;
        }

        return this.mainForm.invalid;
    }

    getTitle(): string {
        return this.isEdit ? `Edit Book` : `Add Book`;
    }

    getStep(): number {
        return this.stepper?.selectedIndex;
    }

    getDepartment(id: string): Department {
        const departments = this.store.selectSnapshot(DepartmentState.Departments);
        return departments.find(department => department.id === id);
    }

    getAuthors(ids: string[]): string {
        const authors = this.store.selectSnapshot(AuthorState.Authors);
        return authors.filter(author => ids?.includes(author.id)).map(author => author.name).join(', ');
    }

    getGenres(ids: string[]): string {
        const genres = this.store.selectSnapshot(GenreState.Genres);
        return genres.filter(genre => ids?.includes(genre.id)).map(genre => genre.name).join(', ');
    }

    getImage(): string {
        return `url("${this.image || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'}")`;
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

    createBook() {
        const { isbn, title, quantity, department: DepartmentId } = this.mainForm.value;
        const { description, authors: authorsIds, genres: genresIds, year, language } = this.detailsForm.value;
        const book: Book = {
            isbn, title, quantity, department: { id: DepartmentId } as Department, description, image: this.image,
            authors: authorsIds.map(id => ({ id })), genres: genresIds.map(id => ({ id })), year, language
        };
        this.store.dispatch(new CreateBook(book)).subscribe(() => this.onClose());
    }

    onClose(): void {
        this.dialogRef.close();
    }

    onImageChanged(event: Event): void {
        this.file = event;
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

        this.createBook();
    }

    onAddAuthors() {
        this.dialog.open(AuthorPopupComponent, { data: {}, disableClose: true, width: '568px' });
    }

    onAddDepartment() {
        this.dialog.open(DepartmentPopupComponent, { data: {}, disableClose: true, width: '568px' });
    }
}
