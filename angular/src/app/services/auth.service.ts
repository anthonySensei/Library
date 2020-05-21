import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserRoles } from '../constants/userRoles';
import { serverLink } from '../constants/serverLink';

import { User } from '../models/user.model';
import { Student } from '../models/student.model';
import { ResponseService } from './response.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    isLoggedIn = false;
    loggedChange = new Subject<boolean>();

    isManagerRole = false;
    managerChange = new Subject<boolean>();

    isLibrarianRole = false;
    librarianChange = new Subject<boolean>();

    user: User;
    userChanged = new BehaviorSubject<User>(null);

    jwtTokenChanged = new Subject<string>();
    jwtToken: string;

    tokenExpirationTimer;

    REGISTRATION_URL = `${serverLink}/registration`;
    LOGIN_URL = `${serverLink}/login`;
    LOGOUT_URL = `${serverLink}/logout`;
    CHECK_REGISTRATION_TOKEN_URL = `${serverLink}/check-registration-token`;

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setUser(user) {
        this.user = user;
        this.userChanged.next(this.user);
    }

    getUser() {
        return this.user;
    }

    isAuthenticated() {
        return new Promise(resolve => {
            resolve(this.isLoggedIn);
        });
    }

    isManager() {
        return new Promise(resolve => {
            resolve(this.isManagerRole);
        });
    }

    isLibrarian() {
        return new Promise(resolve => {
            resolve(this.isLibrarianRole);
        });
    }

    setIsLoggedIn(isLoggedIn: boolean) {
        this.isLoggedIn = isLoggedIn;
        this.loggedChange.next(this.isLoggedIn);
    }

    getIsLoggedIn() {
        return this.isLoggedIn;
    }

    setIsManager(isManager: boolean) {
        this.isManagerRole = isManager;
        this.managerChange.next(this.isManagerRole);
    }

    setIsLibrarian(isLibrarian: boolean) {
        this.isLibrarianRole = isLibrarian;
        this.librarianChange.next(this.isLibrarianRole);
    }

    setJwtToken(token) {
        this.jwtToken = token;
        this.jwtTokenChanged.next(this.jwtToken);
    }

    getJwtToken(): string {
        return this.jwtToken;
    }

    login(user: { password: string; email: string }): Observable<any> {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http.post(this.LOGIN_URL, user, { headers }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
                let userRole;
                if (response.data.user) {
                    this.setUser(response.data.user);
                    userRole = this.user.role.role;
                    this.setRole(userRole);
                    if (response.data.user) {
                        this.setJwtToken(response.data.token);
                        this.handleAuthentication(
                            response.data.token,
                            response.data.tokenExpiresIn
                        );
                    }
                }
            })
        );
    }

    private handleAuthentication(token: string, expiresIn: number) {
        const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
        );
        const tokenData = {
            token,
            expirationDate
        };
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('tokenData', JSON.stringify(tokenData));
        localStorage.setItem('userData', JSON.stringify(this.user));
    }

    autoLogin() {
        const user = JSON.parse(localStorage.getItem('userData'));
        const tokenData: {
            token: string;
            expirationDate: string;
        } = JSON.parse(localStorage.getItem('tokenData'));
        if (!user) {
            return;
        }

        if (!tokenData) {
            return this.logout();
        }

        if (tokenData.token) {
            this.setRole(user.role.role);
            this.setUser(user);
            this.setJwtToken(tokenData.token);
            const expirationDuration =
                new Date(tokenData.expirationDate).getTime() -
                new Date().getTime();
            this.setIsLoggedIn(true);
            this.loggedChange.next(true);
            this.autoLogout(expirationDuration);
        } else {
            this.logout();
        }
    }

    setRole(role: string) {
        if (role === UserRoles.MANAGER) {
            this.setIsManager(true);
            this.setIsLibrarian(true);
        } else if (role === UserRoles.LIBRARIAN) {
            this.setIsManager(false);
            this.setIsLibrarian(true);
        } else {
            this.setIsManager(false);
            this.setIsLibrarian(false);
        }
    }

    logout() {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http.get(this.LOGOUT_URL, { headers }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
                this.setUser(null);
                localStorage.clear();
                this.setJwtToken(null);
                this.tokenExpirationTimer = null;
            })
        );
    }

    autoLogout(expirationDuration: number) {
        if (expirationDuration < 0) {
            this.logout();
            localStorage.clear();
        }
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    registerStudentHttp(student: Student) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http.post(this.REGISTRATION_URL, student, { headers }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    checkRegistrationToken(registrationToken: string) {
        const headers = new HttpHeaders();
        const token = {
            registrationToken
        };
        headers.append('Content-type', 'application/json');
        return this.http
            .post(this.CHECK_REGISTRATION_TOKEN_URL, token, { headers })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}