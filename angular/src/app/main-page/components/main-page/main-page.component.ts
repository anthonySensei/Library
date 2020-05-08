import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';
import { BookService } from '../../services/book.service';

import { Book } from '../../models/book.model';

import { Subscription } from 'rxjs';

import { Filters } from '../../../constants/filters';
import { Author } from '../../models/author.model';
import { Genre } from '../../models/genre.model';
import { Department } from '../../models/department.model';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.sass']
})
export class MainPageComponent implements OnInit, OnDestroy {
    books: Book[] = [];
    authors: Author[] = [];
    genres: Genre[] = [];
    departments: Department[] = [];

    paramsSubscription: Subscription;
    booksChangeSubscription: Subscription;
    booksFetchSubscription: Subscription;
    loggedInSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    departmentChangeSubscription: Subscription;
    authorsFetchSubscription: Subscription;
    authorsChangeSubscription: Subscription;

    isLoading = false;
    isLoggedIn = false;
    showFilterButton = true;

    filterName = Filters.NOTHING;
    authorSelect = null;
    genreSelect = null;
    departmentSelect = null;
    filterValue = null;

    fromYear: number;
    toYear: number;

    bookFilters = [
        { name: 'Nothing', value: Filters.NOTHING },
        { name: 'Title', value: Filters.TITLE },
        { name: 'ISBN', value: Filters.ISBN }
    ];

    currentPage = 1;

    constructor(
        private authService: AuthService,
        private bookService: BookService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        document.title = 'Library';
        this.isLoading = true;
        this.paramsHandle();
        this.subscriptionsHandle();
        this.isLoggedIn = this.authService.getIsLoggedIn();
        this.books = this.bookService.getBooks();
    }

    paramsHandle() {
        this.paramsSubscription = this.route.queryParams.subscribe(
            (params: Params) => {
                this.currentPage = +params.page || 1;
            }
        );
    }

    subscriptionsHandle() {
        this.booksFetchSubscription = this.bookService
            .fetchAllBooksHttp(
                this.currentPage,
                this.authorSelect,
                this.genreSelect,
                this.departmentSelect,
                this.fromYear,
                this.toYear,
                this.filterName,
                this.filterValue
            )
            .subscribe();
        this.booksChangeSubscription = this.bookService.booksChanged.subscribe(
            (books: Book[]) => {
                this.books = books;
                this.isLoading = false;
            }
        );
        this.loggedInSubscription = this.authService.loggedChange.subscribe(
            isLoggedIn => {
                this.isLoggedIn = isLoggedIn;
            }
        );
        this.departmentsFetchSubscription = this.bookService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentChangeSubscription = this.bookService.departmentsChanged.subscribe(
            departments => {
                this.departments = departments;
            }
        );
        this.authorsFetchSubscription = this.bookService
            .fetchAllAuthorsHttp()
            .subscribe();
        this.authorsChangeSubscription = this.bookService.authorsChanged.subscribe(
            authors => {
                this.authors = authors;
            }
        );
    }

    toggleFilterButton() {
        this.showFilterButton = !this.showFilterButton;
    }

    clearInputs() {
        this.filterName = Filters.NOTHING;
        this.filterValue = '';
        this.genreSelect = '';
        this.authorSelect = '';
        this.fromYear = null;
        this.toYear = null;
    }

    search() {
        this.bookService
            .fetchAllBooksHttp(
                this.currentPage,
                this.authorSelect,
                this.genreSelect,
                this.departmentSelect,
                this.fromYear,
                this.toYear,
                this.filterName,
                this.filterValue
            )
            .subscribe();
        this.books = this.bookService.getBooks();
    }

    ngOnDestroy(): void {
        this.loggedInSubscription.unsubscribe();
        this.paramsSubscription.unsubscribe();
        this.booksChangeSubscription.unsubscribe();
        this.booksFetchSubscription.unsubscribe();
        this.departmentsFetchSubscription.unsubscribe();
        this.departmentChangeSubscription.unsubscribe();
        this.authorsFetchSubscription.unsubscribe();
        this.authorsChangeSubscription.unsubscribe();
    }
}
