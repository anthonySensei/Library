import { User } from '../user/user.model';
import { Book } from '../main-page/book.model';
import { Department } from '../main-page/department.model';

export class Statistic {
    id: number;
    loanTime: Date;
    returnedTime: Date;
    student: User;
    librarian: User;
    books: Book[];
    book: Book;
    department: Department;

    constructor() {}
}
