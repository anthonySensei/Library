import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Librarian } from '../models/librarian.model';

@Injectable({
    providedIn: 'root'
})
export class LibrarianService {
    ADD_LIBRARIAN_URL = 'http://localhost:3000/add-librarian';
    GET_LIBRARIANS_URL = 'http://localhost:3000/librarians';
    GET_LIBRARIAN_URL = 'http://localhost:3000/librarian';

    authJSONResponseChanged = new Subject<{}>();
    authJSONResponse = {};

    librarians: Librarian[] = [];
    librariansChanged = new Subject<Librarian[]>();

    librarian: Librarian;
    librarianChanged = new Subject<Librarian>();

    constructor(private http: HttpClient) {}

    setAuthJSONResponse(response) {
        this.authJSONResponse = response;
        this.authJSONResponseChanged.next(this.authJSONResponse);
    }

    getAuthJSONResponse() {
        return this.authJSONResponse;
    }

    setLibrarians(librarians: Librarian[]) {
        this.librarians = librarians;
        this.librariansChanged.next(this.librarians);
    }

    getLibrarians() {
        return this.librarians;
    }

    setLibrarian(librarian: Librarian) {
        this.librarian = librarian;
        this.librarianChanged.next(this.librarian);
    }

    getLibrarian() {
        return this.librarian;
    }

    addLibrarianHttp(email: string) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http.post(this.ADD_LIBRARIAN_URL, email, { headers }).pipe(
            map((response: any) => {
                this.setAuthJSONResponse(response);
            })
        );
    }

    getLibrariansHttp() {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http.get(this.GET_LIBRARIANS_URL, { headers }).pipe(
            map((response: any) => {
                this.setLibrarian(response.data.librarians);
            })
        );
    }
}
