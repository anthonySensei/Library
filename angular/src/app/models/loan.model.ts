import { Student } from './student.model';
import { Book } from './book.model';
import { Department } from './department.model';
import { Librarian } from './librarian.model';

export class Loan {
    id: number;
    loanTime: Date;
    returnedTime: Date;
    student: Student;
    librarian: Librarian;
    book: Book;
    department: Department;

    constructor() {}
}
