import { Book } from './book.model';
import { User } from './user.model';
import { Pagination } from './pagination.model';

export interface Order {
    _id?: string;
    orderedAt?: Date;
    loanedAt?: Date;
    user: User | string;
    librarian: User | string;
    book: Book | string;
}

export interface GetOrders extends Pagination {
    userId?: string;
    librarianId?: string;
    filterValue?: string;
    showOnlyNotLoaned?: boolean;
    showOnlyLoaned?: boolean;
    loanedAt?: Date;
}
