import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { Book } from '../../models/book.model';

import { BookService } from '../../services/book.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MaterialService } from '../../../shared/services/material.service';
import { OrderService } from '../../../user/services/orders.service';
import { ResponseService } from '../../../shared/services/response.service';

import { LoanBookModalComponent } from '../loan-book-modal/loan-book-modal.component';

import { UserRoles } from '../../../constants/userRoles';
import { AngularLinks } from '../../../constants/angularLinks';
import { SnackBarClasses } from '../../../constants/snackBarClasses';

import { User } from '../../../auth/models/user.model';
import { Response } from '../../models/response.model';

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
    snackbarDuration = 5000;

    isLoading = false;

    paramsSubscription: Subscription;
    bookSubscription: Subscription;
    getBookSubscription: Subscription;
    userSubscription: Subscription;

    userRole: string;

    readerTicket: string;

    response: Response;
    links = AngularLinks;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookService: BookService,
        private authService: AuthService,
        private responseService: ResponseService,
        private materialService: MaterialService,
        private orderService: OrderService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
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

    handleBookSubscriptions() {
        this.getBookSubscription = this.bookService
            .getBookHttp(this.bookId)
            .subscribe();
        this.bookSubscription = this.bookService.bookChanged.subscribe(book => {
            this.book = book;
            if (!this.book) {
                this.router.navigate([AngularLinks.ERROR_PAGE]);
            }
            this.isLoading = false;
        });
        this.book = this.bookService.getBook();
    }

    handleUserSubscription() {
        this.userSubscription = this.authService.userChanged.subscribe(user => {
            this.user = user;
            this.userRole = user.role.role;
        });
        this.userRole = this.authService.getUser().role.role;
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
                return false;
            }
            const loanData = {
                studentTicketReader: result.readerTicket,
                librarianEmail: this.user.email,
                bookId: this.bookId,
                time: new Date()
            };
            this.bookService.loanBookHttp(loanData).subscribe(() => {
                this.response = this.responseService.getResponse();
                if (this.response.isSuccessful) {
                    this.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                } else {
                    this.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Danger,
                        this.snackbarDuration
                    );
                }
            });
        });
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    orderBook() {
        this.orderService
            .orderBookHttp({
                studentEmail: this.user.email,
                bookId: this.bookId,
                time: new Date()
            })
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                if (this.response.isSuccessful) {
                    this.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                } else {
                    this.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Danger,
                        this.snackbarDuration
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.paramsSubscription.unsubscribe();
        this.getBookSubscription.unsubscribe();
        this.bookSubscription.unsubscribe();
    }
}
