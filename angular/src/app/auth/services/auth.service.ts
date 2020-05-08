import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserRoles } from '../../constants/userRoles';

import { User } from '../models/user.model';

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

    authJSONResponseChanged = new Subject<{}>();
    authJSONResponse = {};

    jwtTokenChanged = new Subject<string>();
    jwtToken: string;

    tokenExpirationTimer;

    REGISTRATION_URL = 'http://localhost:3000/registration';
    LOGIN_URL = 'http://localhost:3000/login';
    LOGOUT_URL = 'http://localhost:3000/logout';
    CHECK_REGISTRATION_TOKEN_URL =
        'http://localhost:3000/check-registration-token';

    constructor(private http: HttpClient) {}

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

    setAuthJSONResponse(response) {
        this.authJSONResponse = response;
        this.authJSONResponseChanged.next(this.authJSONResponse);
    }

    getAuthJSONResponse() {
        return this.authJSONResponse;
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
                this.setAuthJSONResponse(response);
                let userRole;
                if (response.data.user && response.data.user.readerTicket) {
                    this.setUser(response.data.user);
                    userRole = UserRoles.STUDENT;
                } else if (response.data.user) {
                    this.setUser(response.data.user);
                    userRole = this.user.role.role;
                }
                this.setRole(userRole);
                if (response.data.user) {
                    this.setJwtToken(response.data.token);
                    this.handleAuthentication(
                        response.data.token,
                        response.data.tokenExpiresIn
                    );
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
        const userData = JSON.parse(localStorage.getItem('userData'));
        const tokenData: {
            token: string;
            expirationDate: string;
        } = JSON.parse(localStorage.getItem('tokenData'));
        if (!userData) {
            return;
        }

        if (!tokenData) {
            return this.logout();
        }

        if (tokenData.token) {
            let user;
            if (userData.readerTicket) {
                user = {
                    name: userData.name,
                    email: userData.email,
                    profileImage: userData.profileImage,
                    readerTicket: userData.readerTicket
                };
                this.setRole(UserRoles.STUDENT);
            } else {
                user = {
                    name: userData.name,
                    email: userData.email,
                    profileImage: userData.profileImage,
                    role: userData.role
                };
                this.setRole(user.role.role);
            }
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
                this.setAuthJSONResponse(response);
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

    registerUserHttp(user) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http.post(this.REGISTRATION_URL, user, { headers }).pipe(
            map((response: any) => {
                this.setAuthJSONResponse(response);
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
                    this.setAuthJSONResponse(response);
                })
            );
    }
}
