import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Student } from '../models/student.model';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    STUDENTS_URL = 'http://localhost:3000/students';

    students: Student[] = [];
    studentsChanged = new Subject<Student[]>();

    student: Student;
    studentChanged = new Subject<Student>();

    constructor(private http: HttpClient) {}

    setStudents(students: Student[]) {
        this.students = students;
        this.studentsChanged.next(this.students);
    }

    getStudents() {
        return this.students;
    }

    setStudent(student: Student) {
        this.student = student;
        this.studentChanged.next(this.student);
    }

    getStudent() {
        return this.student;
    }

    getStudentsHttp() {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http.get(this.STUDENTS_URL, { headers }).pipe(
            map((response: any) => {
                this.setStudents(response.data.students);
            })
        );
    }

    getStudentHttp(studentId: number) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.STUDENTS_URL}/student?studentId=${studentId}`, { headers })
            .pipe(
                map((response: any) => {
                    this.setStudent(response.data.student);
                })
            );
    }
}
