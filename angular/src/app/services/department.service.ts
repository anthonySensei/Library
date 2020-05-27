import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { Department } from '../models/department.model';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    private DEPARTMENTS_URL = `${serverLink}/departments`;

    private departments = new Subject<Department[]>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setDepartments(departments: Department[]): void {
        this.departments.next(departments);
    }

    getDepartments(): Observable<Department[]> {
        return this.departments;
    }

    fetchAllDepartmentsHttp() {
        return this.http.get(this.DEPARTMENTS_URL).pipe(
            map((response: any) => {
                this.setDepartments(response.data.departments);
            })
        );
    }

    addDepartmentHttp(department: Department) {
        return this.http.post(this.DEPARTMENTS_URL, { department }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }
    editDepartmentHttp(departmentId: number, address: string) {
        return this.http
            .put(this.DEPARTMENTS_URL, { departmentId, address })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
    deleteDepartmentHttp(departmentId: number) {
        return this.http
            .delete(this.DEPARTMENTS_URL, {
                params: new HttpParams().set(
                    'departmentId',
                    departmentId.toString()
                )
            })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
