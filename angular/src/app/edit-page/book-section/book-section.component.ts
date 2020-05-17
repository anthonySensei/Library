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

import { Book } from '../../main-page/models/book.model';
import { Department } from '../../main-page/models/department.model';
import { Response } from '../../main-page/models/response.model';

import { ResponseService } from '../../shared/services/response.service';
import { BookService } from '../../main-page/services/book.service';

import { SnackBarClasses } from '../../constants/snackBarClasses';
import { AngularLinks } from '../../constants/angularLinks';

@Component({
    selector: 'app-book-section',
    templateUrl: './book-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class BookSectionComponent implements OnInit, OnDestroy {
    @Output() onOpenSnackbar = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() departmentSelect: number;
    @Input() departments: Department[];

    allBooks: Book[];
    booksForSelect: Book[];

    booksFetchSubscription: Subscription;
    booksChangeSubscription: Subscription;

    bookSelect = null;

    response: Response;

    links = AngularLinks;

    constructor(private bookService: BookService, private router: Router) {}

    ngOnInit() {
        this.booksFetchSubscription = this.bookService
            .fetchBooksISBNsHttp()
            .subscribe();
        this.booksChangeSubscription = this.bookService.booksChanged.subscribe(
            books => {
                this.allBooks = books;
            }
        );
    }

    editBook() {
        if (!this.bookSelect || !this.departmentSelect) {
            return;
        }
        this.router.navigate(['/', this.links.ADD_BOOK], {
            queryParams: { id: this.bookSelect }
        });
    }

    deleteBook() {
        if (!this.departmentSelect || !this.bookSelect) {
            return;
        }
        this.bookSelect = null;
        this.departmentSelect = null;
        this.bookService.deleteBookHttp(this.bookSelect).subscribe(() => {
            this.bookResponseHandler();
        });
    }

    bookResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.bookService.fetchBooksISBNsHttp().subscribe();
            this.allBooks = this.bookService.getBooks();
        } else {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    setBooksForSelect() {
        this.booksForSelect = this.allBooks.filter(
            book => book.department.id === this.departmentSelect
        );
    }

    ngOnDestroy(): void {
        this.booksFetchSubscription.unsubscribe();
        this.booksChangeSubscription.unsubscribe();
    }
}
