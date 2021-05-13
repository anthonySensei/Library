import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { serverLink } from '../constants/serverLink';
import { Response } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
    private STUDENTS_URL = `${serverLink}/students`;

    constructor(private http: HttpClient) {}

    getStudents(filterValue: string, sortName: string, sortOrder: string, pageNumber: number, pageSize: number) {
        const params = new HttpParams()
            .set('filterValue', filterValue)
            .set('sortOrder', sortOrder)
            .set('sortName', sortName)
            .set('pageNumber', (pageNumber + 1).toString())
            .set('pageSize', pageSize.toString());
        return this.http.get(this.STUDENTS_URL, { params }).pipe(map((response: Response) => response.data));
    }

    getStudent(studentId: string) {
        return this.http.get(`${this.STUDENTS_URL}/${studentId}`).pipe(map((response: Response) => response.data));
    }
}
