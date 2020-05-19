import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Department } from '../models/department.model';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';
import { Author } from '../models/author.model';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    DEPARTMENTS_URL = `${serverLink}/departments`;

    departmentsChanged = new Subject<Department[]>();
    departments: Department[] = [];

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setDepartments(departments: Department[]) {
        this.departments = departments;
        this.departmentsChanged.next(this.departments);
    }

    getDepartments() {
        return this.departments;
    }

    fetchAllDepartmentsHttp() {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.DEPARTMENTS_URL}`, {
                headers
            })
            .pipe(
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
            .delete(`${this.DEPARTMENTS_URL}?departmentId=${departmentId}`)
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
