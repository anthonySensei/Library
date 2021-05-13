import { Book } from './book.model';
import { Department } from './department.model';

export class Loan {
    id: number;
    loanTime: Date;
    returnedTime: Date;
    student;
    librarian: any;
    book: Book;
    department: Department;

    constructor() {}
}
