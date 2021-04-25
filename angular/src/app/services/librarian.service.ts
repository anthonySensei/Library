import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { Librarian } from '../models/librarian.model';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';
import { HelperService } from './helper.service';

@Injectable({
    providedIn: 'root'
})
export class LibrarianService {
    private LIBRARIANS_URL = `${serverLink}/librarians`;
    private LIBRARIANS_ALL_URL = `${this.LIBRARIANS_URL}/all`;
    private LIBRARIANS_DETAILS_URL = `${this.LIBRARIANS_URL}/details`;

    private librarians = new Subject<Librarian[]>();

    private librarian = new Subject<Librarian>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService,
        private helperService: HelperService
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

    getLibrariansHttp(
        filterName: string = '',
        filterValue: string = '',
        departmentId: number = null,
        sortOrder = 'asc',
        pageNumber = 0,
        pageSize = 5
    ): Observable<Librarian[]> {
        return this.http
            .get(this.LIBRARIANS_URL, {
                params: new HttpParams()
                    .set('filterName', filterName ? filterName : '')
                    .set('filterValue', filterValue)
                    .set(
                        'departmentId',
                        departmentId ? departmentId.toString() : ''
                    )
                    .set('sortOrder', sortOrder)
                    .set('pageNumber', (pageNumber + 1).toString())
                    .set('pageSize', pageSize.toString())
            })
            .pipe(
                map((response: any) => {
                    this.helperService.setItemsPerPage(response.data.quantity);
                    return response.data.librarians;
                })
            );
    }

    getAllLibrariansHttp() {
        return this.http.get(this.LIBRARIANS_ALL_URL).pipe(
            map((response: any) => {
                this.setLibrarians(response.data.librarians);
            })
        );
    }

    getLibrarianHttp(librarianId: number) {
        return this.http
            .get(this.LIBRARIANS_DETAILS_URL, {
                params: new HttpParams().set(
                    'librarianId',
                    librarianId.toString()
                )
            })
            .pipe(
                map((response: any) => {
                    this.setLibrarian(response.data.librarian);
                })
            );
    }

    ediLibrarianHttp(librarianId: string, email: string, departmentId: number) {
        return this.http
            .put(this.LIBRARIANS_URL, {
                librarianId,
                email,
                departmentId
            })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }

    deleteLibrarianHttp(librarianId: string) {
        return this.http
            .delete(this.LIBRARIANS_URL, {
                params: new HttpParams().set('librarianId', librarianId.toString())
            })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
