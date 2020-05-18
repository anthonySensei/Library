import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Librarian } from '../models/librarian.model';

import { ResponseService } from '../../shared/services/response.service';

import { serverLink } from '../../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class LibrarianService {
    LIBRARIANS_URL = `${serverLink}/librarians`;
    LIBRARIANS_DETAILS_URL = `${this.LIBRARIANS_URL}/details`;

    librarians: Librarian[] = [];
    librariansChanged = new Subject<Librarian[]>();

    librarian: Librarian;
    librarianChanged = new Subject<Librarian>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

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

    addLibrarianHttp(librarianData) {
        return this.http.post(this.LIBRARIANS_URL, librarianData).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    getLibrariansHttp() {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http.get(this.LIBRARIANS_URL, { headers }).pipe(
            map((response: any) => {
                this.setLibrarians(response.data.librarians);
            })
        );
    }

    getLibrarianHttp(librarianId: number) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.LIBRARIANS_DETAILS_URL}?librarianId=${librarianId}`, {
                headers
            })
            .pipe(
                map((response: any) => {
                    this.setLibrarian(response.data.librarian);
                })
            );
    }
}
