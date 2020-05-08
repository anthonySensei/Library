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
    booksSubscription: Subscription;
    loggedInSubscription: Subscription;

    isLoading = false;
    isLoggedIn = false;
    showFilterButton = true;

    filterName = 'all';
    authorSelect = '';
    genreSelect = '';
    departmentSelect = '';
    filterValue = '';

    fromYear: number;
    toYear: number;

    bookFilters = [
        { name: 'Title', value: Filters.BOOK_NAME },
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
        this.bookService.fetchAllBooksHttp(this.currentPage).subscribe();
        this.booksSubscription = this.bookService.booksChanged.subscribe(
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
    }

    toggleFilterButton() {
        this.showFilterButton = !this.showFilterButton;
    }

    clearInputs() {
        this.filterName = 'all';
        this.filterValue = '';
        this.genreSelect = '';
        this.authorSelect = '';
        this.fromYear = null;
        this.toYear = null;
    }

    ngOnDestroy(): void {
        this.loggedInSubscription.unsubscribe();
        this.paramsSubscription.unsubscribe();
        this.booksSubscription.unsubscribe();
    }
}
