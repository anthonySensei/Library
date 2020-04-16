import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { Book } from '../book.model';
import { User } from '../../user/user.model';

import { BookService } from '../book.service';
import { AuthService } from '../../auth/auth.service';
import { MaterialService } from '../../shared/material.service';

import { LoanBookModalComponent } from '../loan-book-modal/loan-book-modal.component';

import { userRoles } from '../../constants/userRoles';
import { angularLinks } from '../../constants/angularLinks';

import { SnackBarClassesEnum } from '../../shared/snackBarClasses.enum';

@Component({
    selector: 'app-book-details',
    templateUrl: './book-details.component.html',
    styleUrls: ['./book-details.component.sass']
})
export class BookDetailsComponent implements OnInit, OnDestroy {
    roles = userRoles;
    book: Book;
    user: User;

    bookId: number;
    snackbarDuration = 5000;

    isLoading = false;

    paramsSubscription: Subscription;
    bookSubscription: Subscription;
    getBookSubscription: Subscription;

    message: string;
    error: string;
    userRole: string;

    readerTicket: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookService: BookService,
        private authService: AuthService,
        private materialService: MaterialService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.authService.autoLogin();
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.bookId = +params.id;
            }
        );
        this.user = this.authService.getUser();
        if (this.user) {
            this.userRole = this.user.role.role;
        } else {
            this.userRole = '';
        }
        this.handleBookSubscriptions();
    }

    handleBookSubscriptions() {
        this.getBookSubscription = this.bookService
            .getBookHttp(this.bookId)
            .subscribe();
        this.bookSubscription = this.bookService.bookChanged.subscribe(book => {
            this.book = book;
            if (!this.book) {
                this.router.navigate([angularLinks.ERROR_PAGE]);
            }
            this.isLoading = false;
        });
        this.book = this.bookService.getBook();
    }

    openLoanBookModal(): void {
        const dialogRef = this.dialog.open(LoanBookModalComponent, {
            width: '70%',
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
                studentName: result.name,
                librarianId: this.user.id,
                bookId: this.bookId,
                time: new Date()
            };
            this.bookService.loanBookHttp(loanData).subscribe(() => {
                this.openSnackBar(
                    this.message,
                    SnackBarClassesEnum.Success,
                    this.snackbarDuration
                );
            });
        });
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    ngOnDestroy(): void {
        this.paramsSubscription.unsubscribe();
        this.getBookSubscription.unsubscribe();
        this.bookSubscription.unsubscribe();
    }
}
