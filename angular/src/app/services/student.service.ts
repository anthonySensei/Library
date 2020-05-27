import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Student } from '../models/student.model';

import { serverLink } from '../constants/serverLink';
import { ResponseService } from './response.service';
import { HelperService } from './helper.service';

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    private STUDENTS_URL = `${serverLink}/students`;
    private STUDENTS_ALL_URL = `${this.STUDENTS_URL}/all`;
    private STUDENTS_DETAILS_URL = `${this.STUDENTS_URL}/details`;

    private students = new Subject<Student[]>();
    private student = new Subject<Student>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService,
        private helperService: HelperService
    ) {}

    setStudents(students: Student[]): void {
        this.students.next(students);
    }

    getStudents(): Observable<Student[]> {
        return this.students;
    }

    setStudent(student: Student): void {
        this.student.next(student);
    }

    getStudent(): Observable<Student> {
        return this.student;
    }

    getAllStudentsHttp() {
        return this.http.get(this.STUDENTS_ALL_URL).pipe(
            map((response: any) => {
                this.setStudents(response.data.students);
            })
        );
    }

    getStudentsHttp(
        filterName: string = '',
        filterValue: string = '',
        sortOrder = 'asc',
        pageNumber = 0,
        pageSize = 5
    ): Observable<Student[]> {
        return this.http
            .get(this.STUDENTS_URL, {
                params: new HttpParams()
                    .set('filterName', filterName ? filterName : '')
                    .set('filterValue', filterValue)
                    .set('sortOrder', sortOrder)
                    .set('pageNumber', (pageNumber + 1).toString())
                    .set('pageSize', pageSize.toString())
            })
            .pipe(
                map((response: any) => {
                    this.setStudents(response.data.students);
                    this.helperService.setItemsPerPage(response.data.quantity);
                    return response.data.students;
                })
            );
    }

    getStudentHttp(studentId: number) {
        return this.http
            .get(this.STUDENTS_DETAILS_URL, {
                params: new HttpParams().set('studentId', studentId.toString())
            })
            .pipe(
                map((response: any) => {
                    this.setStudent(response.data.student);
                })
            );
    }

    addStudentHttp(student) {
        return this.http.post(this.STUDENTS_URL, student).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
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
            .delete(this.STUDENTS_URL, {
                params: new HttpParams().set('studentId', studentId.toString())
            })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
