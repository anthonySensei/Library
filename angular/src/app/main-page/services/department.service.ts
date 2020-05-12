import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Department } from '../models/department.model';
import { ResponseService } from '../../shared/services/response.service';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    DEPARTMENTS_URL = 'http://localhost:3000/departments';

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
}
