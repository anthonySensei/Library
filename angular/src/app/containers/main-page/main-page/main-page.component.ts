import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { BookService } from '../../../services/book.service';
import { DepartmentService } from '../../../services/department.service';
import { AuthorService } from '../../../services/author.service';
import { GenreService } from '../../../services/genre.service';

import { Subscription } from 'rxjs';

import { Filters } from '../../../constants/filters';

import { Book } from '../../../models/book.model';
import { Author } from '../../../models/author.model';
import { Genre } from '../../../models/genre.model';
import { Department } from '../../../models/department.model';
import { User } from '../../../models/user.model';
import { UserRoles } from '../../../constants/userRoles';
import { AngularLinks } from '../../../constants/angularLinks';
import { Role } from '../../../models/role.model';

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
    role: Role;

    paramsSubscription: Subscription;
    booksSubscription: Subscription;
    booksFetchSubscription: Subscription;
    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    authorsSubscription: Subscription;
    authorsFetchSubscription: Subscription;
    genresSubscription: Subscription;
    genresFetchSubscription: Subscription;
    userSubscription: Subscription;

    isLoading: boolean;
    showFilterButton = true;

    filterName = Filters.NOTHING;
    authorSelect: number;
    genreSelect: number;
    departmentSelect: number;
    filterValue: string;

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

    ngOnInit(): void {
        document.title = 'Library';
        this.isLoading = true;
        this.paramsHandle();
        this.subscriptionsHandle();
    }

    paramsHandle(): void {
        this.paramsSubscription = this.route.queryParams.subscribe(
            (params: Params) => {
                this.currentPage = +params.page || 1;
            }
        );
    }

    booksSubscriptionHandle(): void {
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
        this.booksSubscription = this.bookService
            .getBooks()
            .subscribe((books: Book[]) => {
                this.books = books || [];
                this.isLoading = false;
            });
    }

    subscriptionsHandle(): void {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
                this.departmentSelect = departments[0].id;
                this.booksSubscriptionHandle();
            });
        this.authorsFetchSubscription = this.authorService
            .fetchAllAuthorsHttp()
            .subscribe();
        this.authorsSubscription = this.authorService
            .getAuthors()
            .subscribe((authors: Author[]) => {
                this.authors = authors;
            });
        this.genresFetchSubscription = this.genreService
            .fetchAllGenresHttp()
            .subscribe();
        this.genresSubscription = this.genreService
            .getGenres()
            .subscribe((genres: Genre[]) => {
                this.genres = genres;
            });
        this.userSubscription = this.authService
            .getUser()
            .subscribe((user: User) => {
                this.role = user
                    ? user.role
                    : new Role(null, this.roles.STUDENT);
            });
    }

    toggleFilterButton(): void {
        this.showFilterButton = !this.showFilterButton;
    }

    clearInputs(): void {
        this.filterName = Filters.NOTHING;
        this.filterValue = '';
        this.genreSelect = null;
        this.authorSelect = null;
        this.fromYear = null;
        this.toYear = null;
    }

    showBooksByDepartment(): void {
        this.filterName = Filters.NOTHING;
        this.authorSelect = null;
        this.genreSelect = null;
        this.filterValue = null;
        this.booksSubscriptionHandle();
    }

    ngOnDestroy(): void {
        this.paramsSubscription.add(this.booksSubscription);
        this.paramsSubscription.add(this.booksFetchSubscription);
        this.paramsSubscription.add(this.departmentsSubscription);
        this.paramsSubscription.add(this.departmentsFetchSubscription);
        this.paramsSubscription.add(this.authorsSubscription);
        this.paramsSubscription.add(this.authorsFetchSubscription);
        this.paramsSubscription.add(this.userSubscription);
        this.paramsSubscription.unsubscribe();
    }
}
