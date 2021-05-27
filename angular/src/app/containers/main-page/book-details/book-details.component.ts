import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { Book, BookStats } from '../../../models/book.model';
import { User } from '../../../models/user.model';

import { BookService } from '../../../services/book.service';

import { LoanBookPopupComponent } from './loan-book-modal/loan-book-popup.component';
import { AngularLinks } from '../../../constants/angularLinks';
import { PageTitles } from '../../../constants/pageTitles';
import { ModalWidth } from '../../../constants/modalWidth';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/state/user.state';
import { BookState, DeleteBook, LoadBook, LoadBookStats, OrderBook } from '../../../store/state/book.state';
import { Author } from '../../../models/author.model';
import { Genre } from '../../../models/genre.model';
import { LocalizationService } from '../../../services/localization.service';
import { BookPopupComponent } from '../../../components/popups/book-popup/book-popup.component';
import { LoadAuthors } from '../../../store/state/author.state';
import { LoadGenres } from '../../../store/state/genre.state';

// import { ReadPopupComponent } from '../../../components/popups/read-popup/read-popup.component';

@Component({
    selector: 'app-book-details',
    templateUrl: './book-details.component.html',
    styleUrls: ['./book-details.component.scss']
})
export class BookDetailsComponent implements OnInit, OnDestroy {

    isLoading: boolean;
    bookId: string;
    readerTicket: string;
    view: number[] = [240, 440];
    colorScheme = { domain: ['#FFFFFF', '#FFDF6C', '#C30415'] };
    cardColor = '#202020';
    user: User;
    links = AngularLinks;
    stats = [];

    @Select(UserState.User)
    user$: Observable<User>;

    @Select(BookState.Book)
    book$: Observable<Book>;

    @Select(BookState.BookStats)
    bookStats$: Observable<BookStats>;

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
        this.getBookStats$();
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.user = user || {} as User);
    }

    getBookStats$(): void {
        this.bookStats$.pipe(untilDestroyed(this)).subscribe(bookStats => {
            this.stats = [
                { name: 'Loans All Time', value: bookStats?.loansAllTime },
                { name: 'Loans Last Month', value: bookStats?.loansForLastMonth },
                { name: 'Not Returned', value: bookStats?.notReturnedBooks },
            ];
        });
    }

    getLanguage(languageCode: string): string {
        return this.localizationService.getLanguageName(languageCode);
    }

    getAuthors(authors: Author[]): string {
        return authors?.map(author => author?.name).join(', ') || '';
    }

    getGenres(genres: Genre[]): string {
        return genres?.map(genre => genre?.name?.en).join(', ') || '';
    }

    loadBook(id?: string) {
        this.bookId = this.bookId || id;
        this.store
            .dispatch([new LoadBook(this.bookId), new LoadBookStats(this.bookId)])
            .subscribe(() => this.isLoading = false);
    }

    // onReadBook() {
    //     const book = this.store.selectSnapshot(BookState.Book);
    //     this.dialog.open(ReadPopupComponent, { data: book.file, disableClose: true, width: '768px'  });
    // }

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
