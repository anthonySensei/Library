import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../auth/auth.service';

import { Book } from './book.model';

import { Subscription } from 'rxjs';

import { ActivatedRoute, Params } from '@angular/router';
import { BookService } from './book.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.sass']
})
export class MainPageComponent implements OnInit, OnDestroy {
    books: Book[] = [];

    paramsSubscription: Subscription;
    booksSubscription: Subscription;
    loggedInSubscription: Subscription;

    isLoading = false;
    isLoggedIn = false;

    currentPage = 1;

    constructor(
        private authService: AuthService,
        private bookService: BookService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.authService.autoLogin();
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

    ngOnDestroy(): void {
        this.loggedInSubscription.unsubscribe();
        this.paramsSubscription.unsubscribe();
        this.booksSubscription.unsubscribe();
    }
}
