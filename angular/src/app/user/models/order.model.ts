import { Student } from '../../user/models/student.model';
import { Book } from '../../main-page/models/book.model';
import { Department } from '../../main-page/models/department.model';

export class Order {
    id: number;
    orderTime: Date;
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
