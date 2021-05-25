import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { Book } from '../../../models/book.model';
import { User } from '../../../models/user.model';

import { BookService } from '../../../services/book.service';

import { LoanBookPopupComponent } from './loan-book-modal/loan-book-popup.component';
import { AngularLinks } from '../../../constants/angularLinks';
import { PageTitles } from '../../../constants/pageTitles';
import { ModalWidth } from '../../../constants/modalWidth';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/state/user.state';
import { BookState, DeleteBook, LoadBook, OrderBook } from '../../../store/state/book.state';
import { Author } from '../../../models/author.model';
import { Genre } from '../../../models/genre.model';
import { LocalizationService } from '../../../services/localization.service';
import { BookPopupComponent } from '../../../components/popups/book-popup/book-popup.component';
import { LoadAuthors } from '../../../store/state/author.state';
import { LoadGenres } from '../../../store/state/genre.state';
import { ReadPopupComponent } from '../../../components/popups/read-popup/read-popup.component';

@Component({
    selector: 'app-book-details',
    templateUrl: './book-details.component.html',
    styleUrls: ['./book-details.component.sass']
})
export class BookDetailsComponent implements OnInit, OnDestroy {
    user: User;

    isLoading: boolean;
    bookId: string;
    readerTicket: string;

    links = AngularLinks;

    @Select(UserState.User)
    user$: Observable<User>;

    @Select(BookState.Book)
    book$: Observable<Book>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store,
        private bookService: BookService,
        private localizationService: LocalizationService,
        public dialog: MatDialog
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.BOOK_DETAILS;
        this.isLoading = true;
        this.route.params.pipe(untilDestroyed(this)).subscribe((params: Params) => this.loadBook(params.id));
        this.store.dispatch([new LoadAuthors(), new LoadGenres()]);
        this.getUser$();
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.user = user || {} as User);
    }

    getLanguage(languageCode: string): string {
        return this.localizationService.getLanguageName(languageCode);
    }

    getAuthors(authors: Author[]): string {
        return authors.map(author => author?.name).join(', ');
    }

    getGenres(genres: Genre[]): string {
        return genres.map(genre => genre?.name?.en).join(', ');
    }

    loadBook(id?: string) {
        this.bookId = this.bookId || id;
        this.store.dispatch(new LoadBook(this.bookId)).subscribe(() => this.isLoading = false);
    }

    onReadBook() {
        const book = this.store.selectSnapshot(BookState.Book);
        this.dialog.open(ReadPopupComponent, { data: book.file, disableClose: true, width: '768px'  });
    }

    onOpenLoanBookModal(): void {
        this.dialog.open(LoanBookPopupComponent, {
            width: ModalWidth.W30P,
            data: { readerTicket: this.readerTicket }
        });
    }

    onOrderBook(): void {
        this.store.dispatch(new OrderBook());
    }

    onEditBook() {
        const book = this.store.selectSnapshot(BookState.Book);
        this.dialog.open(BookPopupComponent, { data: book, disableClose: true, width: '768px'  });
    }

    onDeleteBook() {
        this.store.dispatch(new DeleteBook(this.bookId)).subscribe(() => this.router.navigate([this.links.BOOKS]));
    }

    ngOnDestroy(): void {}
}
