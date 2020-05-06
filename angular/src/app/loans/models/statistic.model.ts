import { Student } from '../../user/models/student.model';
import { Book } from '../../main-page/models/book.model';
import { Department } from '../../main-page/models/department.model';
import { Librarian } from '../../user/models/librarian.model';

export class Statistic {
    id: number;
    loanTime: Date;
    returnedTime: Date;
    student: Student;
    librarian: Librarian;
    books: Book[];
    book: Book;
    department: Department;

    constructor() {}
}
