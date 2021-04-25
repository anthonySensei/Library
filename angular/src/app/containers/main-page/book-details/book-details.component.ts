import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { Book } from '../../../models/book.model';
import { User } from '../../../models/user.model';

import { BookService } from '../../../services/book.service';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/orders.service';
import { ResponseService } from '../../../services/response.service';
import { HelperService } from '../../../services/helper.service';

import { LoanBookModalComponent } from './loan-book-modal/loan-book-modal.component';
import { MoveBookModalComponent } from './move-book-modal/move-book-modal.component';
import { AngularLinks } from '../../../constants/angularLinks';
import { PageTitles } from '../../../constants/pageTitles';
import { ModalWidth } from '../../../constants/modalWidth';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select } from '@ngxs/store';
import { UserState } from '../../../store/user.state';

@Component({
    selector: 'app-book-details',
    templateUrl: './book-details.component.html',
    styleUrls: ['./book-details.component.sass']
})
export class BookDetailsComponent implements OnInit, OnDestroy {
    book: Book;
    user: User;

    bookId: number;
    isLoading: boolean;
    readerTicket: string;

    links = AngularLinks;

    @Select(UserState.User)
    user$: Observable<User>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookService: BookService,
        private authService: AuthService,
        private responseService: ResponseService,
        private helperService: HelperService,
        private orderService: OrderService,
        public dialog: MatDialog
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.BOOK_DETAILS;
        this.isLoading = true;
        this.route.params.pipe(untilDestroyed(this)).subscribe((params: Params) => this.bookId = +params.id);
        this.handleBookSubscriptions();
        this.getUser$();
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.user = user || {} as User);
    }

    handleBookSubscriptions(): void {
        this.bookService.getBookHttp(this.bookId).pipe(untilDestroyed(this)).subscribe();
        this.bookService.getBook().pipe(untilDestroyed(this)).subscribe(async (book: Book) => {
                this.book = book;

                if (!this.book) {
                    await this.router.navigate([AngularLinks.ERROR_PAGE]);
                }

                this.isLoading = false;
            });
    }

    openLoanBookModal(): void {
        const dialogRef = this.dialog.open(LoanBookModalComponent, {
            width: ModalWidth.W30P,
            data: {
                readerTicket: this.readerTicket
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }
            const loanData = {
                studentTicketReader: result.readerTicket,
                librarianEmail: this.user.email,
                bookId: this.bookId,
                time: new Date()
            };
            this.bookService.loanBookHttp(loanData).pipe(untilDestroyed(this)).subscribe(() => {
                this.responseHandle();
                this.handleBookSubscriptions();
            });
        });
    }

    openMoveBookModal(): void {
        const dialogRef = this.dialog.open(MoveBookModalComponent, {
            width: ModalWidth.W30P,
            data: {
                availableBooks: this.book.quantity,
                bookDepartmentId: this.book.id
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }
            this.bookService
                .moveBookHttp(
                    this.book,
                    result.departmentId,
                    result.booksToMove
                )
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    this.responseHandle();
                    this.handleBookSubscriptions();
                });
        });
    }

    orderBook(): void {
        this.orderService
            .orderBookHttp({
                studentEmail: this.user.email,
                bookId: this.bookId,
                time: new Date()
            })
            .subscribe(() => {
                this.responseService.responseHandle();
            });
    }

    responseHandle(): void {
        this.responseService.responseHandle();
    }

    ngOnDestroy(): void {}
}
