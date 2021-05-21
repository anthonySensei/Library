import { Book } from './book.model';
import { Author } from './author.model';
import { Genre } from './genre.model';
import { Schedule } from './schedule.model';
import { Loan } from './loan.model';
import { User } from './user.model';
import { Order } from './order.model';
import { Pagination } from './pagination.model';
import { Statistic, SummaryStatistic } from './request/loan';

export interface Data {
    message: string;
    quantity?: number;
    book?: Book;
    books?: Book[];
    authors?: Author[];
    genres?: Genre[];
    user?: User;
    student?: User;
    librarian?: User;
    librarians?: User[];
    students?: User[];
    statistic?: Statistic[];
    pagination: Pagination;
    summaryStatistic: SummaryStatistic;
    orders?: Order[];
    schedules?: Schedule[];
    loans?: Loan[];
}

export interface Response {
    data: Data;
    responseCode: number;
    message: string;
}
