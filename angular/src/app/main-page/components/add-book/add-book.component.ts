import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Observable, Subject, Subscription } from 'rxjs';

import { BookService } from '../../services/book.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MaterialService } from '../../../shared/services/material.service';
import { CanComponentDeactivate } from '../../../shared/services/can-deactivate-guard.service';
import { DepartmentService } from '../../services/department.service';
import { AuthorService } from '../../services/author.service';
import { GenreService } from '../../services/genre.service';
import { ValidationService } from '../../../shared/services/validation.service';

import { Book } from '../../models/book.model';
import { Department } from '../../models/department.model';
import { User } from '../../../auth/models/user.model';
import { Author } from '../../models/author.model';
import { Genre } from '../../models/genre.model';

import { SnackBarClasses } from '../../../constants/snackBarClasses';

import { ModalBookCreateDialogComponent } from './choose-book-image-modal/choose-book-image-modal.component';
import { AddOptionModalComponent } from './add-option-modal/add-option-modal.component';
import { ResponseService } from '../../../shared/services/response.service';

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

    message: string;
    error: string;
    response;

    responseSubscription: Subscription;
    userSubscription: Subscription;
    paramsSubscription: Subscription;

    departmentsFetchSubscription: Subscription;
    departmentChangeSubscription: Subscription;
    authorsFetchSubscription: Subscription;
    authorsChangeSubscription: Subscription;
    genresFetchSubscription: Subscription;
    genresChangeSubscription: Subscription;

    user: User;

    editMode = false;
    bookId: number;

    isLoading = false;

    discard = false;
    discardChanged = new Subject<boolean>();

    book: Book;

    departments: Department[];
    authors: Author[];
    genres: Genre[];

    snackbarDuration = 5000;

    choosePostImageWidth = '40%';
    addOptionModalWidth = '30%';

    imageToUploadBase64: string = null;

    oldPassword: string;
    newPassword: string;
    retypeNewPassword: string;

    isbnValidation;

    constructor(
        private bookService: BookService,
        private departmentService: DepartmentService,
        private authorService: AuthorService,
        private genreService: GenreService,
        private responseService: ResponseService,
        private authService: AuthService,
        public materialService: MaterialService,
        public validationService: ValidationService,
        private router: Router,
        private route: ActivatedRoute,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.isbnValidation = this.validationService.getIsbnValidation();
        this.initializeForm();
        this.handleParams();
        this.handleUser();
        this.selectsValuesSubscriptionHandle();
        if (this.editMode) {
            this.isLoading = true;
        }
    }

    selectsValuesSubscriptionHandle() {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentChangeSubscription = this.departmentService.departmentsChanged.subscribe(
            departments => {
                this.departments = departments;
            }
        );
        this.authorsFetchSubscription = this.authorService
            .fetchAllAuthorsHttp()
            .subscribe();
        this.authorsChangeSubscription = this.authorService.authorsChanged.subscribe(
            authors => {
                this.authors = authors;
            }
        );
        this.genresFetchSubscription = this.genreService
            .fetchAllGenresHttp()
            .subscribe();
        this.genresChangeSubscription = this.genreService.genresChanged.subscribe(
            genres => {
                this.genres = genres;
            }
        );
    }

    initializeForm() {
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

    handleUser() {
        this.userSubscription = this.authService.userChanged.subscribe(user => {
            this.user = user;
        });
        this.user = this.authService.getUser();
    }

    handleParams() {
        this.paramsSubscription = this.route.queryParams.subscribe(
            (queryParams: Params) => {
                this.bookId = +queryParams.id;
                this.editMode = queryParams.id != null;
            }
        );
    }

    hasError(controlName: string, errorName: string) {
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
            width: this.choosePostImageWidth,
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
            width: this.addOptionModalWidth,
            data: {
                option
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.response = null;
            if (!result) {
                return;
            }
            if (result.option === 'author') {
                this.authorService
                    .addAuthorHttp({ id: null, name: result.name })
                    .subscribe(() => {
                        this.response = this.responseService.getResponse();
                        if (this.response.isSuccessful) {
                            this.openSnackBar(
                                this.response.message,
                                SnackBarClasses.Success,
                                this.snackbarDuration
                            );
                            this.authorService
                                .fetchAllAuthorsHttp()
                                .subscribe();
                            this.authors = this.authorService.getAuthors();
                        } else {
                            this.openSnackBar(
                                this.response.message,
                                SnackBarClasses.Danger,
                                this.snackbarDuration
                            );
                        }
                    });
            } else {
                this.genreService
                    .addGenreHttp({ id: null, name: result.name })
                    .subscribe(() => {
                        this.response = this.responseService.getResponse();
                        if (this.response.isSuccessful) {
                            this.openSnackBar(
                                this.response.message,
                                SnackBarClasses.Success,
                                this.snackbarDuration
                            );
                            this.genreService.fetchAllGenresHttp().subscribe();
                            this.genres = this.genreService.getGenres();
                        } else {
                            this.openSnackBar(
                                this.response.message,
                                SnackBarClasses.Danger,
                                this.snackbarDuration
                            );
                        }
                    });
            }
        });
    }

    onAddBook(stepper) {
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
            this.openSnackBar(
                'Image was not selected',
                SnackBarClasses.Warn,
                this.snackbarDuration
            );
            return false;
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
        } else {
            this.addBookToLibrary(book, this.imageToUploadBase64, stepper);
        }
    }

    addBookToLibrary(book: Book, imageToUploadBase64: string, stepper) {
        this.bookService
            .addBookHttp(book, imageToUploadBase64)
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                if (this.response.isSuccessful) {
                    stepper.reset();
                    this.message = this.response.message;
                    this.router.navigate(['/books']);
                    this.openSnackBar(
                        this.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                } else {
                    stepper.selectedIndex = 0;
                    this.error = this.response.message;
                    this.mainBookInfoForm.controls.isbn.setErrors({
                        incorrect: true
                    });
                    return false;
                }
            });
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.mainBookInfoForm.touched && !this.response) {
            this.materialService.openDiscardChangesDialog(
                this.discard,
                this.discardChanged
            );
            return this.discardChanged;
        } else {
            return true;
        }
    }

    ngOnDestroy(): void {
        this.paramsSubscription.unsubscribe();
        if (this.responseSubscription) {
            this.responseSubscription.unsubscribe();
        }
        this.userSubscription.unsubscribe();
    }
}
