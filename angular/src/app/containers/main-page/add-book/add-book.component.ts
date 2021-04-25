import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatHorizontalStepper } from '@angular/material';

import { Observable, Subject, Subscription } from 'rxjs';

import { BookService } from '../../../services/book.service';
import { AuthService } from '../../../services/auth.service';
import { MaterialService } from '../../../services/material.service';
import { CanComponentDeactivate } from '../../../shared/can-deactivate-guard.service';
import { DepartmentService } from '../../../services/department.service';
import { AuthorService } from '../../../services/author.service';
import { GenreService } from '../../../services/genre.service';
import { ValidationService } from '../../../services/validation.service';
import { HelperService } from '../../../services/helper.service';
import { ResponseService } from '../../../services/response.service';

import { Book } from '../../../models/book.model';
import { Department } from '../../../models/department.model';
import { User } from '../../../models/user.model';
import { Author } from '../../../models/author.model';
import { Genre } from '../../../models/genre.model';

import { ModalBookCreateDialogComponent } from './choose-book-image-modal/choose-book-image-modal.component';
import { AddOptionModalComponent } from './add-option-modal/add-option-modal.component';

import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { ModalWidth } from '../../../constants/modalWidth';
import { PageTitles } from '../../../constants/pageTitles';
import { DbModels } from '../../../constants/dbModels';
import { WarnMessages } from '../../../constants/warnMessages';
import { AngularLinks } from '../../../constants/angularLinks';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/user.state';
import { untilDestroyed } from 'ngx-take-until-destroy';

export interface DialogData {
    imageBase64: string;
}

@Component({
    selector: 'app-add-book',
    templateUrl: './add-book.component.html'
})
export class AddBookComponent
    implements OnInit, OnDestroy, CanComponentDeactivate {
    mainBookInfoForm: FormGroup;
    bookDetailsForm: FormGroup;

    error: string;

    user: User;

    editMode: boolean;
    bookId: number;
    isLoading: boolean;
    done: boolean;
    discard: boolean;
    discardChanged = new Subject<boolean>();

    book: Book;

    departments: Department[];
    authors: Author[];
    genres: Genre[];

    imageToUploadBase64: string;
    oldPassword: string;
    newPassword: string;
    retypeNewPassword: string;

    isbnValidation: RegExp;

    @Select(UserState.User)
    user$: Observable<User>;

    constructor(
        private bookService: BookService,
        private departmentService: DepartmentService,
        private authorService: AuthorService,
        private genreService: GenreService,
        private responseService: ResponseService,
        private authService: AuthService,
        public materialService: MaterialService,
        public validationService: ValidationService,
        public helperService: HelperService,
        private router: Router,
        private route: ActivatedRoute,
        public dialog: MatDialog
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.ADD_BOOK;
        this.isbnValidation = this.validationService.getIsbnValidation();
        this.initializeForm();
        this.handleParams();
        this.getUser$();
        this.setAuthors();
        this.setDepartments();
        this.setGenres();

        if (this.editMode) {
            this.isLoading = true;
        }
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.user = user || {} as User);
    }

    setAuthors(): void {
        this.authorService.fetchAllAuthorsHttp().pipe(untilDestroyed(this)).subscribe();
        this.authorService.getAuthors().pipe(untilDestroyed(this)).subscribe(authors => this.authors = authors);
    }

    setDepartments(): void {
        this.departmentService.fetchAllDepartmentsHttp().pipe(untilDestroyed(this)).subscribe();
        this.departmentService.getDepartments().pipe(untilDestroyed(this)).subscribe(departments => this.departments = departments);
    }

    setGenres(): void {
        this.genreService.fetchAllGenresHttp().pipe(untilDestroyed(this)).subscribe();
        this.genreService.getGenres().pipe(untilDestroyed(this)).subscribe((genres: Genre[]) =>  this.genres = genres);
    }

    initializeForm(): void {
        this.mainBookInfoForm = new FormGroup({
            isbn: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.isbnValidation)
            ]),
            name: new FormControl(null, [Validators.required]),
            quantity: new FormControl(null, [
                Validators.required,
                Validators.max(420)
            ]),
            address: new FormControl(null, [Validators.required])
        });
        this.bookDetailsForm = new FormGroup({
            author: new FormControl(null, [Validators.required]),
            genre: new FormControl(null, [Validators.required]),
            year: new FormControl(null, [Validators.required]),
            description: new FormControl(null, [Validators.required])
        });
    }

    handleParams(): void {
        this.route.queryParams.pipe(untilDestroyed(this)).subscribe(
            (queryParams: Params) => {
                this.bookId = +queryParams.id;
                this.editMode = !!queryParams.id;
                if (this.editMode) {
                    this.bookService.getBookHttp(this.bookId).subscribe();
                    this.bookService.getBook().subscribe((book: Book) => {
                        this.setValuesToFields(book);
                    });
                }
            }
        );
    }

    setValuesToFields(book: Book): void {
        this.book = book;
        this.mainBookInfoForm.patchValue({
            isbn: this.book.isbn,
            name: this.book.name,
            quantity: this.book.quantity,
            address: this.book.department.id
        });
        this.bookDetailsForm.patchValue({
            author: this.book.author.id,
            genre: this.book.genre.id,
            year: this.book.year,
            description: this.book.description
        });
    }

    hasError(controlName: string, errorName: string): boolean {
        if (this.mainBookInfoForm.controls[controlName]) {
            return this.mainBookInfoForm.controls[controlName].hasError(
                errorName
            );
        } else if (this.bookDetailsForm.controls[controlName]) {
            return this.bookDetailsForm.controls[controlName].hasError(
                errorName
            );
        }
    }

    openChoosePostImageDialog(): void {
        const dialogRef = this.dialog.open(ModalBookCreateDialogComponent, {
            width: ModalWidth.W40P,
            data: {
                imageBase64: ''
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.imageToUploadBase64 = result;
        });
    }

    openAddOptionModal(option: string): void {
        const dialogRef = this.dialog.open(AddOptionModalComponent, {
            width: ModalWidth.W30P,
            data: {
                option
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }
            if (result.option === DbModels.AUTHOR) {
                this.authorService
                    .addAuthorHttp({ id: null, name: result.name })
                    .subscribe(() => {
                        if (this.responseService.responseHandle()) {
                            this.setAuthors();
                        }
                    });
            } else {
                this.genreService
                    .addGenreHttp({ id: null, name: result.name })
                    .subscribe(() => {
                        if (this.responseService.responseHandle()) {
                            this.setGenres();
                        }
                    });
            }
        });
    }

    onAddBook(stepper: MatHorizontalStepper): void {
        const isbn = this.mainBookInfoForm.value.isbn;
        const name = this.mainBookInfoForm.value.name;
        const authorId = this.bookDetailsForm.value.author;
        const genreId = this.bookDetailsForm.value.genre;
        const year = this.bookDetailsForm.value.year;
        const quantity = this.mainBookInfoForm.value.quantity;
        const description = this.bookDetailsForm.value.description;
        const departmentId = this.mainBookInfoForm.value.address;
        if (this.mainBookInfoForm.invalid) {
            return;
        }
        const department = this.departments.find(
            dpr => dpr.id === departmentId
        );
        const author = this.authors.find(aut => aut.id === authorId);
        const genre = this.genres.find(gen => gen.id === genreId);
        if (!this.imageToUploadBase64 && !this.editMode) {
            this.materialService.openSnackbar(
                WarnMessages.IMAGE_NOT_SELECTED,
                SnackBarClasses.Warn
            );
            return;
        }
        const book = new Book(
            null,
            isbn,
            name,
            author,
            genre,
            null,
            null,
            description,
            year,
            quantity,
            department
        );
        if (this.editMode) {
            if (!this.imageToUploadBase64) {
                book.image = this.book.image;
            }
            book.id = this.bookId;
            book.status = this.book.status;
            this.editBook(book, this.imageToUploadBase64, stepper);
        } else {
            this.addBookToLibrary(book, this.imageToUploadBase64, stepper);
        }
    }

    editBook(book: Book, image: string, stepper: MatHorizontalStepper): void {
        this.bookService
            .editBookHttp({ ...book, id: this.bookId }, image)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                if (this.responseService.responseHandle()) {
                    this.done = true;
                    stepper.reset();
                    this.router.navigate([
                        '/',
                        AngularLinks.BOOKS,
                        this.bookId
                    ]);
                } else {
                    stepper.selectedIndex = 0;
                    this.error = this.responseService.getResponse().message;
                    this.mainBookInfoForm.controls.isbn.setErrors({
                        incorrect: true
                    });
                }
            });
    }

    addBookToLibrary(book: Book, imageToUploadBase64: string, stepper): void {
        this.bookService
            .addBookHttp(book, imageToUploadBase64)
            .subscribe(() => {
                if (this.responseService.responseHandle()) {
                    this.done = true;
                    this.router.navigate(['/', AngularLinks.BOOKS]);
                    stepper.reset();
                } else {
                    stepper.selectedIndex = 0;
                    this.error = this.responseService.getResponse().message;
                    this.mainBookInfoForm.controls.isbn.setErrors({
                        incorrect: true
                    });
                }
            });
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.mainBookInfoForm.touched && !this.done) {
            this.materialService.openDiscardChangesDialog(
                this.discard,
                this.discardChanged
            );
            return this.discardChanged;
        } else {
            return true;
        }
    }

    ngOnDestroy(): void {}
}
