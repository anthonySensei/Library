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
    private REGISTRATION_URL = `${serverLink}/registration`;
    private LOGIN_URL = `${serverLink}/login`;
    private LOGOUT_URL = `${serverLink}/logout`;
    private CHECK_REGISTRATION_TOKEN_URL = `${serverLink}/check-registration-token`;
    private PALINDROME_URL =
        'https://palindrome-inc.herokuapp.com/api/user-app/profile';

    private isLoggedIn = false;
    private loggedChange = new Subject<boolean>();

    private isManagerRole: boolean;

    private isLibrarianRole: boolean;

    private user: User;
    private userChanged = new BehaviorSubject<User>(null);

    private jwtToken: string;

    private tokenExpirationTimer;

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setUser(user): void {
        this.user = user;
        this.userChanged.next(this.user);
    }

    getUser(): Observable<User> {
        return this.userChanged;
    }

    isAuthenticated(): Promise<boolean> {
        return new Promise(resolve => {
            resolve(this.isLoggedIn);
        });
    }

    isManager(): Promise<boolean> {
        return new Promise(resolve => {
            resolve(this.isManagerRole);
        });
    }

    isLibrarian(): Promise<boolean> {
        return new Promise(resolve => {
            resolve(this.isLibrarianRole);
        });
    }

    setIsLoggedIn(isLoggedIn: boolean): void {
        this.isLoggedIn = isLoggedIn;
        this.loggedChange.next(this.isLoggedIn);
    }

    setIsManager(isManager: boolean): void {
        this.isManagerRole = isManager;
    }

    setIsLibrarian(isLibrarian: boolean): void {
        this.isLibrarianRole = isLibrarian;
    }

    setRole(role: string): void {
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

    setJwtToken(token: string): void {
        this.jwtToken = token;
    }

    getJwtToken(): string {
        return this.jwtToken;
    }

    login(user: { password: string; email: string }): Observable<any> {
        return this.http.post(this.LOGIN_URL, user).pipe(
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

    private handleAuthentication(token: string, expiresIn: number): void {
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

    autoLogin(): void {
        const user = JSON.parse(localStorage.getItem('userData'));
        const tokenData: {
            token: string;
            expirationDate: string;
        } = JSON.parse(localStorage.getItem('tokenData'));
        if (!user) {
            return;
        }

        if (!tokenData) {
            this.logout();
        } else if (tokenData.token) {
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

    logout() {
        return this.http.get(this.LOGOUT_URL).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
                this.setUser(null);
                localStorage.clear();
                this.setJwtToken(null);
                this.tokenExpirationTimer = null;
            })
        );
    }

    autoLogout(expirationDuration: number): void {
        if (expirationDuration < 0) {
            this.logout();
            localStorage.clear();
        }
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    registerStudentHttp(student: Student) {
        return this.http.post(this.REGISTRATION_URL, student).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    checkRegistrationToken(registrationToken: string) {
        const token = {
            registrationToken
        };
        return this.http.post(this.CHECK_REGISTRATION_TOKEN_URL, token).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    loginWithPalindrome(token: string) {
        return this.http
            .get(this.PALINDROME_URL, {
                headers: new HttpHeaders().set(
                    'Authorization',
                    `Bearer ${token}`
                )
            })
            .pipe(
                map((response: any) => {
                    console.log(response);
                })
            );
    }
}
