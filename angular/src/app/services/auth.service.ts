import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { serverLink } from '../constants/serverLink';
import { Student } from '../models/student.model';
import { ResponseService } from './response.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private REGISTRATION_URL = `${serverLink}/registration`;
    private LOGIN_URL = `${serverLink}/login`;
    private LOGOUT_URL = `${serverLink}/logout`;
    private CHECK_REGISTRATION_TOKEN_URL = `${serverLink}/check-registration-token`;

    private jwtToken: string;

    constructor(
        private http: HttpClient,
        private router: Router,
        private responseService: ResponseService,
    ) {}


    setJwtToken(token: string): void {
        this.jwtToken = token;
    }

    getJwtToken(): string {
        return this.jwtToken;
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post(this.LOGIN_URL, { password, email }).pipe(map((response: any) => response.data));
    }

    logout() {
        return this.http.get(this.LOGOUT_URL).pipe(map((response: any) => response.data));
    }

    registerStudentHttp(student: Student) {
        return this.http.post(this.REGISTRATION_URL, student).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    checkRegistrationToken(registrationToken: string) {
        const token = { registrationToken };

        return this.http.post(this.CHECK_REGISTRATION_TOKEN_URL, token).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }
}
