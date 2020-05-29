import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { BookService } from '../../../services/book.service';
import { DepartmentService } from '../../../services/department.service';
import { AuthorService } from '../../../services/author.service';
import { GenreService } from '../../../services/genre.service';
import { HelperService } from '../../../services/helper.service';

import { Filters } from '../../../constants/filters';
import { UserRoles } from '../../../constants/userRoles';
import { AngularLinks } from '../../../constants/angularLinks';
import { FiltersName } from '../../../constants/filtersName';
import { PageTitles } from '../../../constants/pageTitles';

import { Book } from '../../../models/book.model';
import { Author } from '../../../models/author.model';
import { Genre } from '../../../models/genre.model';
import { Department } from '../../../models/department.model';
import { User } from '../../../models/user.model';
import { Role } from '../../../models/role.model';
import { Pagination } from '../../../models/pagination.model';

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
    paginationData: Pagination;

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
        { name: FiltersName.NOTHING, value: Filters.NOTHING },
        { name: FiltersName.TITLE, value: Filters.TITLE },
        { name: FiltersName.ISBN, value: Filters.ISBN }
    ];

    currentPage: number;

    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number;
    previousPage: number;
    lastPage: number;

    constructor(
        private authService: AuthService,
        private bookService: BookService,
        private authorService: AuthorService,
        private departmentService: DepartmentService,
        private helperService: HelperService,
        private genreService: GenreService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
    }

    ngOnInit(): void {
        document.title = PageTitles.CATALOG;
        this.isLoading = true;
        this.paramsHandle();
    }

    paramsHandle(): void {
        this.paramsSubscription = this.route.queryParams.subscribe(
            (params: Params) => {
                this.currentPage = +params.page || 1;
                this.departmentSelect = +params.department || null;
                this.authorSelect = +params.author || null;
                this.genreSelect = +params.genre || null;
                this.fromYear = +params.fYear || null;
                this.toYear = +params.tYear || null;
                this.filterName = params.fName || null;
                this.filterValue = params.fValue || null;
                this.subscriptionsHandle();
            }
        );
    }

    subscriptionsHandle(): void {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
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
            .subscribe(() => {
                this.paginationData = this.helperService.getPaginationData();
                this.currentPage = this.paginationData.currentPage;
                this.hasNextPage = this.paginationData.hasNextPage;
                this.hasPreviousPage = this.paginationData.hasPreviousPage;
                this.nextPage = this.paginationData.nextPage;
                this.previousPage = this.paginationData.previousPage;
                this.lastPage = this.paginationData.lastPage;
            });
        this.booksSubscription = this.bookService
            .getBooks()
            .subscribe((books: Book[]) => {
                this.books = books || [];
                this.isLoading = false;
            });
    }

    paginate(page: number) {
        this.isLoading = true;
        const department = this.departmentSelect
            ? { department: this.departmentSelect }
            : {};
        const author = this.authorSelect ? { author: this.authorSelect } : {};
        const genre = this.genreSelect ? { genre: this.genreSelect } : {};
        const fYear = this.fromYear ? { fYear: this.fromYear } : {};
        const tYear = this.toYear ? { tYear: this.toYear } : {};
        const fName = this.filterName ? { fName: this.filterName } : {};
        const fValue = this.filterValue ? { fValue: this.filterValue } : {};
        this.router.navigate([''], {
            relativeTo: this.route,
            queryParams: {
                ...department,
                ...author,
                ...genre,
                ...fYear,
                ...tYear,
                ...fName,
                ...fValue,
                page
            }
        });
    }

    toggleFilterButton(): void {
        this.showFilterButton = !this.showFilterButton;
    }

    isNothingFilter(): boolean {
        return this.filterName === Filters.NOTHING;
    }

    isIsbnFilter(): boolean {
        return this.filterName === Filters.ISBN;
    }

    isHaveAccess(): boolean {
        return (
            this.role.role === this.roles.LIBRARIAN ||
            this.role.role === this.roles.MANAGER
        );
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
        this.fromYear = null;
        this.toYear = null;
        this.paginate(1);
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.paramsSubscription, [
            this.booksSubscription,
            this.booksFetchSubscription,
            this.departmentsSubscription,
            this.departmentsFetchSubscription,
            this.departmentsFetchSubscription,
            this.authorsSubscription,
            this.authorsFetchSubscription,
            this.userSubscription
        ]);
    }
}
