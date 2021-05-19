import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Book } from '../../../models/book.model';
import { Department } from '../../../models/department.model';

import { BookService } from '../../../services/book.service';

import { AngularLinks } from '../../../constants/angularLinks';

@Component({
    selector: 'app-book-section',
    templateUrl: './book-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class BookSectionComponent implements OnInit, OnDestroy {
    @Input() departmentSelect: number;
    @Input() departments: Department[];

    booksForSelect: Book[];

    bookSelect: number = null;

    links = AngularLinks;

    constructor(
        private bookService: BookService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.setBooks();
    }

    setBooks(): void {
    }

    async editBook() {
        if (!this.bookSelect || !this.departmentSelect) {
            return;
        }
        await this.router.navigate(['/', this.links.ADD_BOOK], {
            queryParams: { id: this.bookSelect }
        });
    }

    openConfirmDeleteDialog(): void {}

    deleteBook(): void {}

    ngOnDestroy(): void {}
}
