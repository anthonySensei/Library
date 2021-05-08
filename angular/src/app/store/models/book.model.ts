import { Book } from '../../models/book.model';

export class BookStateModel {
    books: Book[] = [];
    book: Book = null;
}
