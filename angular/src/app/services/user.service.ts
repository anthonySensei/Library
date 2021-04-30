import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';
import { User } from '../models/user.model';
import { UpdatePasswordPayload, UpdateUserPayload } from '../models/request/user';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private PROFILE_URL = `${serverLink}/my-account`;
    private USERS_URL = `${serverLink}/users`;

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    getUser(id: string) {
        return this.http.get(`${this.USERS_URL}?id=${id}`).pipe(map((response: any) => response.data));
    }

    createUser(body: UpdateUserPayload) {
        return this.http.post(`${this.USERS_URL}`, body).pipe(map((response: any) => response.data));
    }

    editUser(data: { id: string, body: UpdateUserPayload }) {
        return this.http.put(`${this.USERS_URL}/${data.id}`, data.body).pipe(map((response: any) => response.data));
    }

    editPassword(data: { id: string, body: UpdatePasswordPayload }) {
        return this.http.post(`${this.USERS_URL}/${data.id}`, data.body).pipe(map((response: any) => response.data));
    }

    editImage(id: string, image: string) {
        const headers = new HttpHeaders();
        const formData: FormData = new FormData();
        headers.append('Content-Type', 'multipart/form-data');
        formData.append('user', JSON.stringify({ image }));
        return this.http.patch(`${this.USERS_URL}/${id}`, formData, { headers }).pipe(map((response: any) => response.data));
    }

    deleteUser(id: string) {
        return this.http.delete(`${this.USERS_URL}/${id}`).pipe(map((response: any) => response.data));
    }

    updateUserDataHttp(user: User, changed: string, passwordObject?) {
        const headers = new HttpHeaders();
        const formData: FormData = new FormData();
        headers.append('Content-Type', 'multipart/form-data');
        formData.append('user', JSON.stringify(user));
        formData.append('changedField', changed);

        if (passwordObject) {
            formData.append('passwordObj', JSON.stringify(passwordObject));
        }

        return this.http.put(this.PROFILE_URL, formData, { headers }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }
}
