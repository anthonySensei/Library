import { Book } from './book.model';
import { User } from './user.model';

export interface Loan {
    _id: string;
    createdAt: Date;
    returnedAt: Date;
    student: User;
    librarian: User;
    book: Book;
}
