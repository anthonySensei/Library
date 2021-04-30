import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { serverLink } from '../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class LibrarianService {
    private LIBRARIANS_URL = `${serverLink}/librarians`;

    constructor(
        private http: HttpClient,
    ) {}

    getLibrarians(filterValue: string, sortName: string, sortOrder: string, pageNumber: number, pageSize: number) {
        const params = new HttpParams()
            .set('filterValue', filterValue)
            .set('sortOrder', sortOrder)
            .set('sortName', sortName)
            .set('pageNumber', (pageNumber + 1).toString())
            .set('pageSize', pageSize.toString());
        return this.http.get(this.LIBRARIANS_URL, { params }).pipe(map((response: any) => response.data));
    }

    getLibrarian(librarianId: string) {
        return this.http.get(`${this.LIBRARIANS_URL}/${librarianId}`).pipe(map((response: any) => response.data));
    }
}
