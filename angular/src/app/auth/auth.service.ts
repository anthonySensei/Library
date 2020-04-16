import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../user/user.model';
import { Role } from '../user/role.model';
import { userRoles } from '../constants/userRoles';

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
    userChanged = new Subject<User>();

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

    setUser(user: User) {
        this.user = user;
        this.userChanged.next(this.user);
    }

    getUser() {
        return this.user;
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

    registerUser(user) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http.post(this.REGISTRATION_URL, user, { headers }).pipe(
            map((response: any) => {
                this.setAuthJSONResponse(response);
            })
        );
    }

    login(user: { password: string; email: string }): Observable<any> {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http.post(this.LOGIN_URL, user, { headers }).pipe(
            map((response: any) => {
                this.setAuthJSONResponse(response);
                this.setUser(response.data.user);
                let userRole;
                if (this.user) {
                    userRole = this.user.role.role;
                } else {
                    userRole = '';
                }
                this.setRole(userRole);
                if (response.data.user) {
                    this.setJwtToken(response.data.token);
                    this.handleAuthentication(
                        response.data.user.id,
                        response.data.user.email,
                        response.data.user.role,
                        response.data.user.profileImage,
                        response.data.token,
                        response.data.tokenExpiresIn
                    );
                }
            })
        );
    }

    autoLogin() {
        const userData: {
            id: number;
            name: string;
            email: string;
            profileImage: string;
            password: string;
            createdAt: Date;
            role: Role;
        } = JSON.parse(localStorage.getItem('userData'));
        const tokenData: {
            token: string;
            expirationDate: string;
        } = JSON.parse(localStorage.getItem('tokenData'));
        if (!userData) {
            return;
        }

        const loadedUser = new User(
            userData.id,
            null,
            userData.email,
            userData.profileImage,
            null,
            null,
            null,
            userData.role
        );

        const userRole = loadedUser.role.role;
        this.setRole(userRole);

        if (tokenData.token) {
            this.userChanged.next(loadedUser);
            this.setUser(loadedUser);
            this.userChanged.next(loadedUser);
            this.setJwtToken(tokenData.token);
            const expirationDuration =
                new Date(tokenData.expirationDate).getTime() -
                new Date().getTime();
            this.setIsLoggedIn(true);
            this.loggedChange.next(true);
            this.autoLogout(expirationDuration);
        }
    }

    setRole(role: string) {
        if (role === userRoles.MANAGER) {
            this.setIsManager(true);
            this.setIsLibrarian(true);
        } else if (role === userRoles.LIBRARIAN) {
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

    private handleAuthentication(
        userId,
        email: string,
        role: Role,
        profileImage,
        token: string,
        expiresIn: number
    ) {
        const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
        );
        const user = new User(
            userId,
            null,
            email,
            profileImage,
            null,
            null,
            null,
            role
        );
        const tokenData = {
            token,
            expirationDate
        };
        this.setUser(user);
        this.userChanged.next(user);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('tokenData', JSON.stringify(tokenData));
        localStorage.setItem('userData', JSON.stringify(user));
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
