import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { Book } from '../../../models/book.model';
import { Department } from '../../../models/department.model';
import { Response } from '../../../models/response.model';

import { ResponseService } from '../../../services/response.service';
import { BookService } from '../../../services/book.service';

import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { AngularLinks } from '../../../constants/angularLinks';

@Component({
    selector: 'app-book-section',
    templateUrl: './book-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class BookSectionComponent implements OnInit, OnDestroy {
    @Output() openSnackbar = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() departmentSelect: number;
    @Input() departments: Department[];

    allBooks: Book[];
    booksForSelect: Book[];

    booksSubscription: Subscription;
    booksFetchSubscription: Subscription;
    booksDeleteSubscription: Subscription;

    bookSelect: number = null;

    response: Response;

    links = AngularLinks;

    constructor(private bookService: BookService, private router: Router) {}

    ngOnInit(): void {
        this.setBooks();
    }

    setBooks(): void {
        this.booksFetchSubscription = this.bookService
            .fetchBooksISBNsHttp()
            .subscribe();
        this.booksSubscription = this.bookService
            .getBooks()
            .subscribe((books: Book[]) => {
                this.allBooks = books;
            });
    }

    editBook(): void {
        if (!this.bookSelect || !this.departmentSelect) {
            return;
        }
        this.router.navigate(['/', this.links.ADD_BOOK], {
            queryParams: { id: this.bookSelect }
        });
    }

    deleteBook(): void {
        if (!this.departmentSelect || !this.bookSelect) {
            return;
        }
        this.booksDeleteSubscription = this.bookService
            .deleteBookHttp(this.bookSelect)
            .subscribe(() => {
                this.bookResponseHandler();
            });
    }

    bookResponseHandler(): void {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.bookSelect = null;
            this.departmentSelect = null;
            this.setBooks();
        } else {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    setBooksForSelect(): void {
        this.booksForSelect = this.allBooks.filter(
            book => book.department.id === this.departmentSelect
        );
    }

    ngOnDestroy(): void {
        this.booksSubscription.add(this.booksFetchSubscription);
        this.booksSubscription.add(this.booksDeleteSubscription);
        this.booksSubscription.unsubscribe();
    }
}
