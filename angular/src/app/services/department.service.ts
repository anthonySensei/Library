import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Department } from '../models/department.model';

import { serverLink } from '../constants/serverLink';
import { UpdateDepartmentPayload } from '../models/request/department';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    private DEPARTMENTS_URL = `${serverLink}/departments`;

    constructor(
        private http: HttpClient
    ) {}

    getDepartments() {
        return this.http.get(this.DEPARTMENTS_URL).pipe(map((response: any) => response.data));
    }

    createDepartment(department: Department) {
        return this.http.post(this.DEPARTMENTS_URL, { department }).pipe(map((response: any) => response.data));
    }

    editDepartment(data: { id: string, department: UpdateDepartmentPayload }) {
        return this.http
            .put(`${this.DEPARTMENTS_URL}/${data.id}`, { department: data.department })
            .pipe(map((response: any) => response.data));
    }

    deleteDepartment(id: string) {
        return this.http.delete(`${this.DEPARTMENTS_URL}/${id}`).pipe(map((response: any) => response.data));
    }
}
