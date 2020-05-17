import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';
import { BookService } from '../../services/book.service';
import { DepartmentService } from '../../services/department.service';
import { AuthorService } from '../../services/author.service';
import { GenreService } from '../../services/genre.service';

import { Subscription } from 'rxjs';

import { Filters } from '../../../constants/filters';

import { Book } from '../../models/book.model';
import { Author } from '../../models/author.model';
import { Genre } from '../../models/genre.model';
import { Department } from '../../models/department.model';
import { User } from '../../../auth/models/user.model';
import { UserRoles } from '../../../constants/userRoles';
import { AngularLinks } from '../../../constants/angularLinks';

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
    user: User;

    paramsSubscription: Subscription;
    booksChangeSubscription: Subscription;
    booksFetchSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    departmentChangeSubscription: Subscription;
    authorsFetchSubscription: Subscription;
    authorsChangeSubscription: Subscription;
    genresFetchSubscription: Subscription;
    genresChangeSubscription: Subscription;

    isLoading = false;
    showFilterButton = true;

    filterName = Filters.NOTHING;
    authorSelect = null;
    genreSelect = null;
    departmentSelect = null;
    filterValue = null;

    fromYear: number;
    toYear: number;

    roles = UserRoles;
    links = AngularLinks;

    bookFilters = [
        { name: 'Nothing', value: Filters.NOTHING },
        { name: 'Title', value: Filters.TITLE },
        { name: 'ISBN', value: Filters.ISBN }
    ];

    currentPage = 1;

    constructor(
        private authService: AuthService,
        private bookService: BookService,
        private authorService: AuthorService,
        private departmentService: DepartmentService,
        private genreService: GenreService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        document.title = 'Library';
        this.isLoading = true;
        this.paramsHandle();
        this.subscriptionsHandle();
        this.user = this.authService.getUser();
    }

    paramsHandle() {
        this.paramsSubscription = this.route.queryParams.subscribe(
            (params: Params) => {
                this.currentPage = +params.page || 1;
            }
        );
    }

    booksSubscriptionHandle() {
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
                this.books = books || [];
                this.isLoading = false;
            }
        );
        this.books = this.bookService.getBooks() || [];
    }

    subscriptionsHandle() {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentChangeSubscription = this.departmentService.departmentsChanged.subscribe(
            departments => {
                this.departments = departments;
                this.departmentSelect = departments[0].id;
                this.booksSubscriptionHandle();
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

    showBooksByDepartment() {
        this.filterName = Filters.NOTHING;
        this.authorSelect = null;
        this.genreSelect = null;
        this.filterValue = null;
        this.booksSubscriptionHandle();
    }

    ngOnDestroy(): void {
        this.paramsSubscription.unsubscribe();
        this.booksChangeSubscription.unsubscribe();
        this.booksFetchSubscription.unsubscribe();
        this.departmentsFetchSubscription.unsubscribe();
        this.departmentChangeSubscription.unsubscribe();
        this.authorsFetchSubscription.unsubscribe();
        this.authorsChangeSubscription.unsubscribe();
    }
}
