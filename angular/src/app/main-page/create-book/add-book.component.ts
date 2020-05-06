import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { BookService } from '../services/book.service';
import { AuthService } from '../../auth/services/auth.service';
import { MaterialService } from '../../shared/services/material.service';
import { CanComponentDeactivate } from '../../shared/services/can-deactivate-guard.service';

import { Student } from '../../user/models/student.model';
import { Book } from '../models/book.model';
import { Department } from '../models/department.model';

import { Observable, Subject, Subscription } from 'rxjs';

import { SnackBarClasses } from '../../constants/snackBarClasses';

import { ModalBookCreateDialogComponent } from './choose-book-image-modal/choose-book-image-modal.component';
import { User } from '../../auth/models/user.model';

export interface DialogData {
    imageBase64: string;
}

@Component({
    selector: 'app-create-post',
    templateUrl: './add-book.component.html',
    styleUrls: ['../../auth/components/login/auth.component.sass']
})
export class AddBookComponent
    implements OnInit, OnDestroy, CanComponentDeactivate {
    addBookForm: FormGroup;

    isCreated: boolean;
    message: string;
    error: string;
    response;

    responseSubscription: Subscription;
    userSubscription: Subscription;
    paramsSubscription: Subscription;

    user: User;

    editMode = false;
    bookId: number;

    isUpdated: boolean;
    isLoading = false;
    isDone = false;

    discard = false;
    discardChanged = new Subject<boolean>();

    book: Book;

    departments: Department[];

    snackbarDuration = 5000;
    snackBarMessage = 'Book was added successfully';

    choosePostImageWidth = '70%';

    imageToUploadBase64: string = null;

    oldPassword: string;
    newPassword: string;
    retypeNewPassword: string;

    constructor(
        private bookService: BookService,
        private authService: AuthService,
        public materialService: MaterialService,
        private router: Router,
        private route: ActivatedRoute,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.initializeForm();
        this.handleBooks();
        this.handleParams();
        this.departments = this.bookService.getDepartments();
        this.handleResponse();
        this.handleUser();
        if (this.editMode) {
            this.isLoading = true;
        }
    }

    initializeForm() {
        this.addBookForm = new FormGroup({
            isbn: new FormControl(null, [Validators.required]),
            name: new FormControl(null, [Validators.required]),
            author: new FormControl(null, [Validators.required]),
            genre: new FormControl(null, [Validators.required]),
            year: new FormControl(null, [Validators.required]),
            description: new FormControl(null, [Validators.required]),
            address: new FormControl(null, [Validators.required])
        });
    }

    handleResponse() {
        this.responseSubscription = this.bookService.responseChanged.subscribe(
            (response: {
                responseCode: string;
                data: {
                    bookCreated: boolean;
                    message: string;
                };
            }) => {
                if (response.data) {
                    this.response = response;
                    if (this.response.data.bookCreated) {
                        this.isCreated = this.response.data.bookCreated;
                    } else if (this.response.data.bookUpdated) {
                        this.isUpdated = this.response.data.bookUpdated;
                    }
                }
            }
        );
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

    handleBooks() {
        this.bookService.fetchAllDepartmentsHttp().subscribe();
        this.bookService.departmentsChanged.subscribe(departments => {
            this.departments = departments;
        });
    }

    hasError(controlName: string, errorName: string) {
        return this.addBookForm.controls[controlName].hasError(errorName);
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

    onAddBook() {
        const isbn = this.addBookForm.value.isbn;
        const name = this.addBookForm.value.name;
        const author = this.addBookForm.value.author;
        const genre = this.addBookForm.value.genre;
        const year = this.addBookForm.value.year;
        const description = this.addBookForm.value.description;
        const departmentAddress = this.addBookForm.value.address;
        if (this.addBookForm.invalid) {
            return;
        }
        const department = this.departments.find(
            dpr => dpr.address === departmentAddress
        );
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
            department
        );
        if (this.editMode) {
        } else {
            this.addBookToLibrary(book, this.imageToUploadBase64);
        }
    }

    addBookToLibrary(book: Book, imageToUploadBase64: string) {
        this.bookService.addBooHttp(book, imageToUploadBase64).subscribe(() => {
            if (this.isCreated) {
                this.isDone = true;
                this.message = this.response.data.message;
                this.router.navigate(['/books']);
                this.openSnackBar(
                    this.snackBarMessage,
                    SnackBarClasses.Success,
                    this.snackbarDuration
                );
            } else {
                this.isDone = false;
                this.error = this.response.data.message;
                return false;
            }
        });
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.addBookForm.touched && !this.isDone) {
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
        // this.paramsSubscription.unsubscribe();
        // this.responseSubscription.unsubscribe();
        // this.userSubscription.unsubscribe();
    }
}
