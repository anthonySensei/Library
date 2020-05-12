import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Student } from '../models/student.model';

import { ResponseService } from '../../shared/services/response.service';

import { serverLink } from '../../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    PROFILE_URL = `${serverLink}/my-account`;
    PROFILE_UPDATE_IMAGE_URL = `${this.PROFILE_URL}/update-profile-image`;

    request = {
        user: null,
        changeData: {
            changePassword: false,
            changeInfo: false,
            changeImage: false
        },
        passwordObject: {
            oldPassword: '',
            newPassword: '',
            retypeNewPassword: ''
        }
    };

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    updateUserData(user: Student, changed: string, passwordObject?) {
        const headers = new HttpHeaders();
        if (changed === 'info') {
            this.request.changeData.changeInfo = true;
            this.request.changeData.changeImage = false;
            this.request.changeData.changePassword = false;
            this.request.user = {
                id: user.id,
                name: user.name,
                email: user.email
            };
        } else if (changed === 'password') {
            this.request.passwordObject = passwordObject;
            this.request.user = {
                id: user.id
            };
            this.request.changeData.changeInfo = false;
            this.request.changeData.changeImage = false;
            this.request.changeData.changePassword = true;
        }
        headers.append('Content-type', 'application/json');
        return this.http.post(this.PROFILE_URL, this.request, { headers }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    updateProfileImage(base64Image: string, user: Student) {
        const headers = new HttpHeaders();
        const formData: FormData = new FormData();
        headers.append('Content-Type', 'multipart/form-data');
        formData.append('base64', base64Image);
        formData.append('user', JSON.stringify(user));
        return this.http
            .post(`${this.PROFILE_UPDATE_IMAGE_URL}`, formData, {
                headers
            })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }

    getProfileHttp(userEmail: string) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(this.PROFILE_URL + '?email=' + userEmail, { headers })
            .pipe(map((response: any) => {}));
    }
}
