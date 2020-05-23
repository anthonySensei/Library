import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { Librarian } from '../models/librarian.model';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class LibrarianService {
    private LIBRARIANS_URL = `${serverLink}/librarians`;
    private LIBRARIANS_DETAILS_URL = `${this.LIBRARIANS_URL}/details`;

    private librarians = new Subject<Librarian[]>();

    private librarian = new Subject<Librarian>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setLibrarians(librarians: Librarian[]): void {
        this.librarians.next(librarians);
    }

    getLibrarians(): Observable<Librarian[]> {
        return this.librarians;
    }

    setLibrarian(librarian: Librarian): void {
        this.librarian.next(librarian);
    }

    getLibrarian(): Observable<Librarian> {
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
        return this.http.get(this.LIBRARIANS_URL).pipe(
            map((response: any) => {
                this.setLibrarians(response.data.librarians);
            })
        );
    }

    getLibrarianHttp(librarianId: number) {
        return this.http
            .get(`${this.LIBRARIANS_DETAILS_URL}?librarianId=${librarianId}`)
            .pipe(
                map((response: any) => {
                    this.setLibrarian(response.data.librarian);
                })
            );
    }
}
