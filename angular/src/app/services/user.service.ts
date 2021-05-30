import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { serverLink } from '../constants/serverLink';
import { UpdatePasswordPayload, UpdateUserPayload } from '../models/request/user';
import { Response } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private USERS_URL = `${serverLink}/users`;

    constructor(private http: HttpClient) {}

    getUser(id: string) {
        return this.http.get(`${this.USERS_URL}?id=${id}`).pipe(map((response: Response) => response.data));
    }

    createUser(body: UpdateUserPayload) {
        return this.http.post(`${this.USERS_URL}`, body).pipe(map((response: Response) => response.data));
    }

    editUser(data: { _id: string, body: UpdateUserPayload }) {
        return this.http.put(`${this.USERS_URL}/${data._id}`, data.body).pipe(map((response: Response) => response.data));
    }

    editPassword(data: { _id: string, body: UpdatePasswordPayload }) {
        return this.http.post(`${this.USERS_URL}/${data._id}`, data.body).pipe(map((response: Response) => response.data));
    }

    editImage(id: string, image: string) {
        const headers = new HttpHeaders();
        const formData: FormData = new FormData();
        headers.append('Content-Type', 'multipart/form-data');
        formData.append('user', JSON.stringify({ image }));
        return this.http.patch(`${this.USERS_URL}/${id}`, formData, { headers }).pipe(map((response: Response) => response.data));
    }

    deleteUser(id: string) {
        return this.http.delete(`${this.USERS_URL}/${id}`).pipe(map((response: Response) => response.data));
    }
}
