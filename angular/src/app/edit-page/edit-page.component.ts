import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Department } from '../main-page/models/department.model';
import { Author } from '../main-page/models/author.model';
import { Genre } from '../main-page/models/genre.model';
import { Student } from '../user/models/student.model';
import { Response } from '../main-page/models/response.model';
import { Book } from '../main-page/models/book.model';

import { DepartmentService } from '../main-page/services/department.service';
import { AuthorService } from '../main-page/services/author.service';
import { GenreService } from '../main-page/services/genre.service';
import { BookService } from '../main-page/services/book.service';
import { ResponseService } from '../shared/services/response.service';
import { MaterialService } from '../shared/services/material.service';
import { StudentService } from '../user/services/student.service';

import { SnackBarClasses } from '../constants/snackBarClasses';
import { AngularLinks } from '../constants/angularLinks';
import { ActivatedRoute, Router } from '@angular/router';
import { query } from '@angular/animations';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.sass']
})
export class EditPageComponent implements OnInit {
    departments: Department[];
    allBooks: Book[];
    booksForSelect: Book[];
    authors: Author[];
    genres: Genre[];
    students: Student[];

    departmentsFetchSubscription: Subscription;
    departmentsChangeSubscription: Subscription;
    booksFetchSubscription: Subscription;
    booksChangeSubscription: Subscription;
    authorsFetchSubscription: Subscription;
    authorsChangeSubscription: Subscription;
    genresFetchSubscription: Subscription;
    genresChangeSubscription: Subscription;
    studentsSubscription: Subscription;
    studentsChangedSubscription: Subscription;

    departmentSelect = null;
    departmentAddress = null;
    genreSelect = null;
    genreName = null;
    authorSelect = null;
    authorName = null;
    studentSelect = null;
    studentReaderTicket = null;
    studentEmail = null;
    bookSelect = null;

    response: Response;

    snackbarDuration = 3000;
    nothingToChange = 'Nothing to change';

    links = AngularLinks;

    constructor(
        private bookService: BookService,
        private departmentService: DepartmentService,
        private authorService: AuthorService,
        private genreService: GenreService,
        private responseService: ResponseService,
        public materialService: MaterialService,
        private studentService: StudentService,
        private router: Router
    ) {}

    ngOnInit() {
        this.selectsValuesSubscriptionHandle();
    }

    selectsValuesSubscriptionHandle() {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsChangeSubscription = this.departmentService.departmentsChanged.subscribe(
            departments => {
                this.departments = departments;
            }
        );
        this.booksFetchSubscription = this.bookService
            .fetchBooksISBNsHttp()
            .subscribe();
        this.booksChangeSubscription = this.bookService.booksChanged.subscribe(
            books => {
                this.allBooks = books;
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
        this.studentsSubscription = this.studentService
            .getStudentsHttp()
            .subscribe();
        this.studentsChangedSubscription = this.studentService.studentsChanged.subscribe(
            students => {
                this.students = students;
            }
        );
    }

    getGenre(): Genre {
        return this.genres.find(gen => gen.id === this.genreSelect);
    }

    getAuthor(): Author {
        return this.authors.find(aut => aut.id === this.authorSelect);
    }

    getStudent(): Student {
        return this.students.find(st => st.id === this.studentSelect);
    }

    getDepartment(): Department {
        return this.departments.find(dep => dep.id === this.departmentSelect);
    }

    setDepartmentAddress() {
        this.departmentAddress = this.getDepartment().address;
    }

    setGenreName() {
        this.genreName = this.getGenre().name;
    }

    setAuthorName() {
        this.authorName = this.getAuthor().name;
    }

    setStudentData() {
        this.studentReaderTicket = this.getStudent().readerTicket;
        this.studentEmail = this.getStudent().email;
    }

    editAuthor() {
        if (!this.authorName) {
            return;
        }
        if (this.authorName === this.getAuthor().name) {
            this.nothingChangeHandle();
            return;
        }
        this.authorService
            .editAuthorHttp(this.authorSelect, this.authorName)
            .subscribe(() => {
                this.authorResponseHandler();
            });
    }

    deleteAuthor() {
        if (!this.authorSelect) {
            return;
        }
        this.authorName = null;
        this.authorService.deleteAuthorHttp(this.authorSelect).subscribe(() => {
            this.authorResponseHandler();
            this.authorName = null;
            this.authorSelect = null;
        });
    }

    authorResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.openSnackBar(
                this.response.message,
                SnackBarClasses.Success,
                this.snackbarDuration
            );
            this.authorService.fetchAllAuthorsHttp().subscribe();
            this.authors = this.authorService.getAuthors();
        } else {
            this.openSnackBar(
                this.response.message,
                SnackBarClasses.Danger,
                this.snackbarDuration
            );
        }
    }

    editDepartment() {
        if (!this.departmentAddress) {
            return;
        }
        if (this.departmentAddress === this.getDepartment().address) {
            this.nothingChangeHandle();
            return;
        }
        this.departmentService
            .editDepartmentHttp(this.departmentSelect, this.departmentAddress)
            .subscribe(() => {
                this.departmentResponseHandler();
            });
    }

    deleteDepartment() {
        if (!this.departmentSelect) {
            return;
        }
        this.departmentService
            .deleteDepartmentHttp(this.departmentSelect)
            .subscribe(() => {
                this.departmentResponseHandler();
                this.departmentAddress = null;
                this.departmentSelect = null;
            });
    }

    departmentResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.openSnackBar(
                this.response.message,
                SnackBarClasses.Success,
                this.snackbarDuration
            );
            this.departmentService.fetchAllDepartmentsHttp().subscribe();
            this.departments = this.departmentService.getDepartments();
        } else {
            this.openSnackBar(
                this.response.message,
                SnackBarClasses.Danger,
                this.snackbarDuration
            );
        }
    }

    editBook() {
        if (!this.bookSelect || !this.departmentSelect) {
            return;
        }
        this.router.navigate(['/', this.links.ADD_BOOK], {
            queryParams: { id: this.bookSelect }
        });
    }
    deleteBook() {
        if (!this.departmentSelect || !this.bookSelect) {
            return;
        }
    }

    bookResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.openSnackBar(
                this.response.message,
                SnackBarClasses.Success,
                this.snackbarDuration
            );
            this.bookService.fetchBooksISBNsHttp().subscribe();
            this.allBooks = this.bookService.getBooks();
        } else {
            this.openSnackBar(
                this.response.message,
                SnackBarClasses.Danger,
                this.snackbarDuration
            );
        }
    }

    editGenre() {
        if (!this.genreName) {
            return;
        }
        if (this.genreName === this.getGenre().name) {
            this.nothingChangeHandle();
            return;
        }
        this.genreService
            .ediGenreHttp(this.genreSelect, this.genreName)
            .subscribe(() => {
                this.genreResponseHandler();
            });
    }

    deleteGenre() {
        if (!this.genreSelect) {
            return;
        }
        this.genreService.deleteGenreHttp(this.genreSelect).subscribe(() => {
            this.genreResponseHandler();
            this.genreName = null;
            this.genreSelect = null;
        });
    }

    genreResponseHandler() {
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
    }

    editStudent() {
        if (!this.studentEmail || !this.studentReaderTicket) {
            return;
        }
        if (
            this.studentEmail === this.getStudent().email &&
            this.studentReaderTicket === this.getStudent().readerTicket
        ) {
            this.nothingChangeHandle();
            return;
        }
        this.studentService
            .ediStudentHttp(
                this.studentSelect,
                this.studentEmail,
                this.studentReaderTicket
            )
            .subscribe(() => {
                this.studentResponseHandler();
            });
    }

    deleteStudent() {
        if (!this.studentSelect) {
            return;
        }
        this.studentService
            .deleteStudentHttp(this.studentSelect)
            .subscribe(() => {
                this.studentResponseHandler();
                this.studentSelect = null;
                this.studentEmail = null;
                this.studentReaderTicket = null;
            });
    }

    studentResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.openSnackBar(
                this.response.message,
                SnackBarClasses.Success,
                this.snackbarDuration
            );
            this.studentService.getStudentsHttp().subscribe();
            this.students = this.studentService.getStudents();
        } else {
            this.openSnackBar(
                this.response.message,
                SnackBarClasses.Danger,
                this.snackbarDuration
            );
        }
    }

    nothingChangeHandle() {
        this.openSnackBar(
            this.nothingToChange,
            SnackBarClasses.Warn,
            this.snackbarDuration
        );
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    setBooksForSelect() {
        this.booksForSelect = this.allBooks.filter(
            book => book.department.id === this.departmentSelect
        );
    }
}
