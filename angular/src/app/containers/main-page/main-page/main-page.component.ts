import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { BookService } from '../../../services/book.service';
import { HelperService } from '../../../services/helper.service';
import { AngularLinks } from '../../../constants/angularLinks';
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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {
    user: User;

    isLoading: boolean;
    showFilterButton = true;

    authors: string[];
    genres: string[];
    department: string;
    filterValue: string;
    fromYear: string;
    toYear: string;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('drawer') drawer: MatDrawer;

    @Select(UserState.User)
    user$: Observable<User>;

    @Select(AuthorState.Authors)
    authors$: Observable<Author[]>;

    @Select(DepartmentState.Departments)
    departments$: Observable<Department[]>;

    @Select(GenreState.Genres)
    genres$: Observable<Genre[]>;

    @Select(BookState.Pagination)
    pagination$: Observable<Pagination>;


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
        this.store.dispatch([new LoadAuthors(), new LoadGenres(), new LoadDepartments()]);
        this.getUser$();
        this.loadBooks();
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.user = user || {} as User );
    }

    loadBooks(): void {
        this.isLoading = true;
        this.store
            .dispatch(new LoadBooks({
                page: this.paginator?.pageIndex || 0, authors: this.authors, department: this.department, filterValue: this.filterValue || '',
                genres: this.genres, yearFrom: this.fromYear, yearTo: this.toYear, pageSize: this.paginator?.pageSize || 16
            }))
            .subscribe(() => this.isLoading = false);
    }

    getAllOption(total: number): number {
        return total > 64 ? total : 8;
    }

    onToggleFilterButton(): void {
        this.showFilterButton = !this.showFilterButton;
        this.drawer.toggle();
    }

    isHasAccess(): boolean {
        return (this.user.admin || this.user.librarian);
    }

    clearInputs(): void {
        this.filterValue = '';
        this.genres = null;
        this.authors = null;
        this.fromYear = null;
        this.toYear = null;
    }

    showBooksByDepartment(): void {
        this.loadBooks();
    }

    onAddBook() {
        this.dialog.open(BookPopupComponent, { data: {} as Book, disableClose: true, width: '768px' });
    }

    onPaginate(event: PageEvent) {
        console.log(event);
    }

    onSearch() {
        this.onToggleFilterButton();
        this.loadBooks();
    }

    ngOnDestroy(): void {}
}
