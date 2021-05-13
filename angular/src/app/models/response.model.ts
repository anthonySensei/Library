import { Book } from './book.model';
import { Author } from './author.model';
import { Genre } from './genre.model';
import { Schedule } from './schedule.model';
import { Statistic } from './statistic.model';
import { Loan } from './loan.model';
import { User } from './user.model';
import { Period } from './period.model';
import { Order } from './order.model';
import { Pagination } from './pagination.model';

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
    pagination: Pagination;
    orders?: Order[];
    schedules?: Schedule[];
    statistic?: Statistic[];
    periods?: Period[];
    loans?: Loan[];
}

export interface Response {
    data: Data;
    responseCode: number;
    message: string;
}
