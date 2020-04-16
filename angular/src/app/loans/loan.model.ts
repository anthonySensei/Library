import { User } from '../user/user.model';
import { Book } from '../main-page/book.model';
import { Department } from '../main-page/department.model';

export class Loan {
    id: number;
    loanTime: Date;
    returnedTime: Date;
    student: User;
    librarian: User;
    book: Book;
    department: Department;

    constructor() {}
}
