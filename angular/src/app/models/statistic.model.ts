import { Book } from './book.model';

import { Loan } from './loan.model';
import { User } from './user.model';

export class Statistic implements Loan {
    id: number;
    books: Book[];
    _id: string;
    book: Book;
    createdAt: Date;
    librarian: User;
    returnedAt: Date;
    student: User;
}
