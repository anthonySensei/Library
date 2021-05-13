import { Book } from '../../models/book.model';
import { Pagination } from '../../models/pagination.model';
import { Loan } from '../../models/loan.model';

export class BookStateModel {
    loansTotalItems: number;
    book: Book = null;
    books: Book[] = [];
    loans: Loan[] = [];
    pagination: Pagination = null;
}
