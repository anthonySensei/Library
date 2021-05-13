import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Book } from '../models/book.model';
import { GetBooks } from '../models/request/book';

import { serverLink } from '../constants/serverLink';
import { Response } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class BookService {
    private BOOKS_URL = `${serverLink}/books`;
    private LOAN_BOOK_URL = `${serverLink}/loans`;

    constructor(private http: HttpClient) {}

    getBooks(data: GetBooks) {
        return this.http
            .get(this.BOOKS_URL, {
                params: new HttpParams()
                    .set('page', data.page.toString())
                    .set('pageSize', data.pageSize.toString())
                    .set('yFrom', data.yearFrom ? data.yearFrom.toString() : '')
                    .set('yTo', data.yearTo ? data.yearTo.toString() : '')
                    .set('authors', data.authors?.length ? data.authors.join(',') : '')
                    .set('genres', data.genres?.length ? data.genres.join(',') : '')
                    .set('department', data.department ? data.department.toString() : '')
                    .set('filterValue', data.filterValue)
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

    loanBookHttp(info) {
        return this.http.post(this.LOAN_BOOK_URL, info).pipe(map((response: Response) => response.data));
    }
}
