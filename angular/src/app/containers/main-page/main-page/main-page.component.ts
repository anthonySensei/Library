import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { BookService } from '../../../services/book.service';
import { PageTitles } from '../../../constants/pageTitles';

import { Book } from '../../../models/book.model';
import { Author } from '../../../models/author.model';
import { Genre } from '../../../models/genre.model';
import { User } from '../../../models/user.model';
import { Pagination } from '../../../models/pagination.model';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/state/user.state';
import { Observable } from 'rxjs';
import { AuthorState, LoadAuthors } from '../../../store/state/author.state';
import { GenreState, LoadGenres } from '../../../store/state/genre.state';
import { MatDialog } from '@angular/material/dialog';
import { BookPopupComponent } from '../../../components/popups/book-popup/book-popup.component';
import { BookState, LoadBooks } from '../../../store/state/book.state';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { Language } from '../../../models/language.model';
import { LocalizationState } from '../../../store/state/localization.state';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {

    isLoading: boolean;
    onlyEbooks: boolean;
    onlyNormalBooks: boolean;
    showFilterButton = true;
    toYear: string;
    fromYear: string;
    filterValue: string;
    authors: string[];
    genres: string[];
    user: User;
    languages: Language[];
    filteredLanguages: Observable<Language[]>;
    language = new FormControl(null);

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('drawer') drawer: MatDrawer;

    @Select(UserState.User)
    user$: Observable<User>;

    @Select(AuthorState.Authors)
    authors$: Observable<Author[]>;

    @Select(GenreState.Genres)
    genres$: Observable<Genre[]>;

    @Select(BookState.Pagination)
    pagination$: Observable<Pagination>;

    constructor(
        private authService: AuthService,
        private bookService: BookService,
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
        this.languages = this.store.selectSnapshot(LocalizationState.Languages);
        this.store.dispatch([new LoadAuthors(), new LoadGenres()]);
        this.filteredLanguages = this.language.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterLanguages(value as Language))
            );
        this.getUser$();
        this.loadBooks();
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.user = user || {} as User );
    }

    loadBooks(): void {
        this.isLoading = true;
        const { value: language } = this.language;
        this.store
            .dispatch(new LoadBooks({
                page: this.paginator?.pageIndex || 0, authors: this.authors, filterValue: this.filterValue || '',
                genres: this.genres, yearFrom: this.fromYear, yearTo: this.toYear, pageSize: this.paginator?.pageSize || 16,
                onlyEbooks: this.onlyEbooks || false, onlyNormalBooks: this.onlyNormalBooks, language: language?.code
            }))
            .subscribe(() => this.isLoading = false);
    }

    getAllOption(total: number): number {
        return total > 64 ? total : 8;
    }

    async onToggleFilterButton() {
        this.showFilterButton = !this.showFilterButton;
        await this.drawer.toggle();
    }

    isHasAccess(): boolean {
        return (this.user.admin || this.user.librarian);
    }

    displayWith(obj?: Language): string | undefined {
        return obj ? obj.name : undefined;
    }

    clearInputs(): void {
        this.filterValue = '';
        this.genres = null;
        this.authors = null;
        this.fromYear = null;
        this.toYear = null;
    }

    onAddBook() {
        this.dialog.open(BookPopupComponent, { data: {} as Book, disableClose: true, width: '768px' });
    }

    onPaginate(event: PageEvent) {
        console.log(event);
    }

    async onSearch() {
        await this.onToggleFilterButton();
        this.loadBooks();
    }

    onToggleEbooks(checked: boolean) {
        this.onlyEbooks = checked;
        this.onlyNormalBooks = checked ? false : this.onlyNormalBooks;
    }

    onToggleNormalBooks(checked: boolean) {
        this.onlyNormalBooks = checked;
        this.onlyEbooks = checked ? false : this.onlyEbooks;
    }

    _filterLanguages(value: string | Language): Language[] {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase();

        return this.languages.filter(language => language.name.toLowerCase().includes(filterValue));
    }

    ngOnDestroy(): void {}
}
