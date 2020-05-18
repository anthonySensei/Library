import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Student } from '../models/student.model';

import { serverLink } from '../../constants/serverLink';
import { ResponseService } from '../../shared/services/response.service';

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    STUDENTS_URL = `${serverLink}/students`;
    STUDENTS_DETAILS_URL = `${this.STUDENTS_URL}/details`;

    students: Student[] = [];
    studentsChanged = new Subject<Student[]>();

    student: Student;
    studentChanged = new Subject<Student>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

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
            .get(`${this.STUDENTS_DETAILS_URL}?studentId=${studentId}`, {
                headers
            })
            .pipe(
                map((response: any) => {
                    this.setStudent(response.data.student);
                })
            );
    }

    ediStudentHttp(studentId: number, email: string, readerTicket: string) {
        return this.http
            .put(this.STUDENTS_URL, { studentId, email, readerTicket })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }

    deleteStudentHttp(studentId: number) {
        return this.http
            .delete(`${this.STUDENTS_URL}?studentId=${studentId}`)
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }

    addStudentHttp(student) {
        return this.http
            .post(this.STUDENTS_URL, student)
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
