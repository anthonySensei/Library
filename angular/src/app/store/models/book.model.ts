import { Book } from '../../models/book.model';
import { Pagination } from '../../models/pagination.model';

export class BookStateModel {
    book: Book = null;
    books: Book[] = [];
    pagination: Pagination = null;
}
