import { Book } from './book.model';
import { Department } from './department.model';

export class Order {
    id: number;
    orderTime: Date;
    loanTime: Date;
    student;
    book: Book;
    department: Department;

    constructor(
        id: number,
        orderTime: Date,
        student,
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
