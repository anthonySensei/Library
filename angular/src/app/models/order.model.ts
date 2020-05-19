import { Student } from './student.model';
import { Book } from './book.model';
import { Department } from './department.model';

export class Order {
    id: number;
    orderTime: Date;
    loanTime: Date;
    student: Student;
    book: Book;
    department: Department;

    constructor(
        id: number,
        orderTime: Date,
        student: Student,
        book: Book,
        department: Department
    ) {
        this.id = id;
        this.orderTime = orderTime;
        this.student = student;
        this.book = book;
        this.department = department;
    }
}
