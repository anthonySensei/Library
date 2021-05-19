import { Book } from '../../models/book.model';
import { Pagination } from '../../models/pagination.model';
import { Loan } from '../../models/loan.model';
import { Statistic, SummaryStatistic } from '../../models/request/loan';

export class BookStateModel {
    loansTotalItems: number;
    book: Book = null;
    books: Book[] = [];
    loans: Loan[] = [];
    statistic: Statistic[] = [];
    pagination: Pagination = null;
    summaryStatistic: SummaryStatistic = null;
}
