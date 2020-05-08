import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { Book } from '../../models/book.model';
import { Student } from '../../../user/models/student.model';

import { BookService } from '../../services/book.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MaterialService } from '../../../shared/services/material.service';

import { LoanBookModalComponent } from '../loan-book-modal/loan-book-modal.component';

import { UserRoles } from '../../../constants/userRoles';
import { AngularLinks } from '../../../constants/angularLinks';

import { SnackBarClasses } from '../../../constants/snackBarClasses';

@Component({
    selector: 'app-book-details',
    templateUrl: './book-details.component.html',
    styleUrls: ['./book-details.component.sass']
})
export class BookDetailsComponent implements OnInit, OnDestroy {
    roles = UserRoles;
    book: Book;
    user: Student;

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
        document.title = 'Library';
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.bookId = +params.id;
            }
        );
        this.handleBookSubscriptions();
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
                    SnackBarClasses.Success,
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
