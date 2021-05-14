import { Book } from './book.model';
import { User } from './user.model';

export interface Loan {
    _id?: string;
    loanedAt?: Date;
    returnedAt?: Date;
    student: User | string;
    librarian: User | string;
    book: Book | string;
}
