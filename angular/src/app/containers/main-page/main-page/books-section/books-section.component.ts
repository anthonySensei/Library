import { Component, Input, OnInit } from '@angular/core';
import { Book } from '../../../../models/book.model';

@Component({
    selector: 'app-books-section',
    templateUrl: './books-section.component.html',
    styleUrls: ['./books.component.scss']
})
export class BooksSectionComponent implements OnInit {
    @Input() books: Book[];
    @Input() links;

    constructor() {}

    ngOnInit() {}
}
