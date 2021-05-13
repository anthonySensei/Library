import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { serverLink } from '../constants/serverLink';
import { RegisterUserPayload } from '../models/request/user';
import { Response } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private REGISTRATION_URL = `${serverLink}/registration`;
    private LOGIN_URL = `${serverLink}/login`;
    private LOGOUT_URL = `${serverLink}/logout`;
    private CHECK_ACTIVATION_TOKEN_URL = `${serverLink}/check-activation-token`;

    private jwtToken: string;

    constructor(private http: HttpClient) {}


    setJwtToken(token: string): void {
        this.jwtToken = token;
    }

    getJwtToken(): string {
        return this.jwtToken;
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post(this.LOGIN_URL, { password, email }).pipe(map((response: Response) => response.data));
    }

    logout() {
        return this.http.get(this.LOGOUT_URL).pipe(map((response: Response) => response.data));
    }

    createUser(body: RegisterUserPayload) {
        return this.http.post(this.REGISTRATION_URL, body).pipe(map((response: Response) => response.data));
    }

    checkActivationToken(activationToken: string) {
        return this.http.post(this.CHECK_ACTIVATION_TOKEN_URL, { activationToken }).pipe(map((response: Response) =>  response.data));
    }
}
