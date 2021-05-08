import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { BookService } from '../../../services/book.service';
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
import { Pagination } from '../../../models/pagination.model';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/state/user.state';
import { Observable } from 'rxjs';
import { AuthorState, LoadAuthors } from '../../../store/state/author.state';
import { GenreState, LoadGenres } from '../../../store/state/genre.state';
import { DepartmentState, LoadDepartments } from '../../../store/state/department.state';
import { MatDialog } from '@angular/material/dialog';
import { BookPopupComponent } from '../../../components/popups/book-popup/book-popup.component';
import { BookState, LoadBooks } from '../../../store/state/book.state';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {
    user: User;

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

    @Select(UserState.User)
    user$: Observable<User>;

    @Select(BookState.Books)
    books$: Observable<Book[]>;

    @Select(AuthorState.Authors)
    authors$: Observable<Author[]>;

    @Select(DepartmentState.Departments)
    departments$: Observable<Department[]>;

    @Select(GenreState.Genres)
    genres$: Observable<Genre[]>;

    constructor(
        private authService: AuthService,
        private bookService: BookService,
        private helperService: HelperService,
        private router: Router,
        private route: ActivatedRoute,
        private store: Store,
        private dialog: MatDialog
    ) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
    }

    ngOnInit(): void {
        document.title = PageTitles.CATALOG;
        this.isLoading = true;
        this.store.dispatch([new LoadAuthors(), new LoadGenres(), new LoadDepartments()]);
        this.getUser$();
        this.getBooks();
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.user = user || {} as User );
    }

    getBooks(): void {
        this.store
            .dispatch(new LoadBooks({
                page: 0, author: null, department: null, filterName: null, filterValue: null,
                genre: null, yearFrom: null, yearTo: null
            }))
            .subscribe(() => this.isLoading = false);
    }

    paginate(page: number) {}

    toggleFilterButton(): void {
        this.showFilterButton = !this.showFilterButton;
    }

    isNothingFilter(): boolean {
        return this.filterName === Filters.NOTHING;
    }

    isIsbnFilter(): boolean {
        return this.filterName === Filters.ISBN;
    }

    isHasAccess(): boolean {
        return (this.user.admin || this.user.librarian);
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

    onAddBook() {
        this.dialog.open(BookPopupComponent, { data: {} as Book, disableClose: true, width: '768px' });
    }

    ngOnDestroy(): void {}
}
