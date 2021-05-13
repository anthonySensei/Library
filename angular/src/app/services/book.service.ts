import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Book } from '../models/book.model';
import { Response } from '../models/response.model';
import { GetLoans } from '../models/request/loan';
import { GetBooks } from '../models/request/book';

import { serverLink } from '../constants/serverLink';


@Injectable({ providedIn: 'root' })
export class BookService {
    private BOOKS_URL = `${serverLink}/books`;
    private LOANS_URL = `${serverLink}/loans`;

    constructor(private http: HttpClient) {}

    getBooks(params: GetBooks) {
        return this.http
            .get(this.BOOKS_URL, {
                params: new HttpParams()
                    .set('page', params.page.toString())
                    .set('pageSize', params.pageSize.toString())
                    .set('yFrom', params.yearFrom ? params.yearFrom.toString() : '')
                    .set('yTo', params.yearTo ? params.yearTo.toString() : '')
                    .set('authors', params.authors?.length ? params.authors.join(',') : '')
                    .set('genres', params.genres?.length ? params.genres.join(',') : '')
                    .set('department', params.department ? params.department.toString() : '')
                    .set('filterValue', params.filterValue)
            })
            .pipe(map((response: Response) => response.data));
    }

    getBook(id: string) {
        return this.http.get(`${this.BOOKS_URL}/${id}`).pipe(map((response: Response) => response.data));
    }

    addBook(book: Book) {
        const headers = new HttpHeaders();
        const formData: FormData = new FormData();
        headers.append('Content-Type', 'multipart/form-data');
        formData.append('book', JSON.stringify(book));
        return this.http.post(this.BOOKS_URL, formData, { headers }).pipe(map((response: Response) => response.data));
    }

    editBook(id: string, book: Book) {
        const headers = new HttpHeaders();
        const formData: FormData = new FormData();
        headers.append('Content-Type', 'multipart/form-data');
        formData.append('book', JSON.stringify(book));
        return this.http.put(`${this.BOOKS_URL}/${id}`, formData, { headers }).pipe(map((response: Response) => response.data));
    }

    deleteBook(id: string) {
        return this.http.delete(`${this.BOOKS_URL}/${id}`).pipe(map((response: Response) => response.data));
    }

    getLoans(params: GetLoans) {
        return this.http
            .get(this.LOANS_URL, {
                params: new HttpParams()
                    .set('page', params.page.toString())
                    .set('pageSize', params.pageSize.toString())
                    .set('userId', params.userId)
                    .set('librarianId', params.librarianId)
                    .set('createdAt', params.createdAt?.toString())
                    .set('returnedAt', params.returnedAt?.toString())
                    .set('sortName', params.sortName)
                    .set('sortOrder', params.sortOrder)
                    .set('showOnlyDebtors', String(params.showOnlyDebtors))
                    .set('filterValue', params.filterValue)
            })
            .pipe(map((response: Response) => response.data));
    }

    loanBookHttp(info) {
        return this.http.post(this.LOANS_URL, info).pipe(map((response: Response) => response.data));
    }
}
