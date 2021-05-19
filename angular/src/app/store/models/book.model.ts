import { Book } from '../../models/book.model';
import { Pagination } from '../../models/pagination.model';
import { Loan } from '../../models/loan.model';
import { Statistic, SummaryStatistic } from '../../models/request/loan';
import { Order } from '../../models/order.model';

export class BookStateModel {
    loansTotalItems: number;
    ordersTotalItems: number;
    book: Book = null;
    books: Book[] = [];
    loans: Loan[] = [];
    orders: Order[] = [];
    statistic: Statistic[] = [];
    pagination: Pagination = null;
    summaryStatistic: SummaryStatistic = null;
}
