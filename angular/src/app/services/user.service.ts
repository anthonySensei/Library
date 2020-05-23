import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private PROFILE_URL = `${serverLink}/my-account`;

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

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
