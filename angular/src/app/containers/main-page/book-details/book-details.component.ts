import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { Book } from '../../../models/book.model';

import { BookService } from '../../../services/book.service';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/orders.service';
import { ResponseService } from '../../../services/response.service';

import { LoanBookModalComponent } from './loan-book-modal/loan-book-modal.component';
import { MoveBookModalComponent } from './move-book-modal/move-book-modal.component';

import { UserRoles } from '../../../constants/userRoles';
import { AngularLinks } from '../../../constants/angularLinks';

import { User } from '../../../models/user.model';
import { HelperService } from '../../../services/helper.service';

@Component({
    selector: 'app-book-details',
    templateUrl: './book-details.component.html',
    styleUrls: ['./book-details.component.sass']
})
export class BookDetailsComponent implements OnInit, OnDestroy {
    roles = UserRoles;
    book: Book;
    user: User;

    bookId: number;

    isLoading: boolean;

    paramsSubscription: Subscription;
    bookSubscription: Subscription;
    bookFetchSubscription: Subscription;
    bookMoveSubscription: Subscription;
    bookOrderSubscription: Subscription;
    bookLoanSubscription: Subscription;
    userSubscription: Subscription;

    userRole: string;

    readerTicket: string;

    links = AngularLinks;

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
        document.title = 'Library';
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.bookId = +params.id;
            }
        );
        this.handleBookSubscriptions();
        this.handleUserSubscription();
    }

    handleBookSubscriptions(): void {
        this.bookFetchSubscription = this.bookService
            .getBookHttp(this.bookId)
            .subscribe();
        this.bookSubscription = this.bookService.getBook().subscribe(book => {
            this.book = book;
            if (!this.book) {
                this.router.navigate([AngularLinks.ERROR_PAGE]);
            }
            this.isLoading = false;
        });
    }

    handleUserSubscription(): void {
        this.userSubscription = this.authService.getUser().subscribe(user => {
            this.user = user;
            this.userRole = user.role.role;
        });
    }

    openLoanBookModal(): void {
        const dialogRef = this.dialog.open(LoanBookModalComponent, {
            width: '30%',
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
            this.bookLoanSubscription = this.bookService
                .loanBookHttp(loanData)
                .subscribe(() => {
                    this.responseHandle();
                    this.handleBookSubscriptions();
                });
        });
    }

    openMoveBookModal(): void {
        const dialogRef = this.dialog.open(MoveBookModalComponent, {
            width: '30%',
            data: {
                availableBooks: this.book.quantity,
                bookDepartmentId: this.book.id
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }
            this.bookMoveSubscription = this.bookService
                .moveBookHttp(
                    this.book,
                    result.departmentId,
                    result.booksToMove
                )
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

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.paramsSubscription, [
            this.bookSubscription,
            this.bookFetchSubscription,
            this.bookLoanSubscription,
            this.bookMoveSubscription,
            this.bookOrderSubscription,
            this.userSubscription
        ]);
    }
}
