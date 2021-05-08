import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { Book } from '../models/book.model';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';
import { HelperService } from './helper.service';
import { GetBooks } from '../models/request/book';

@Injectable({
    providedIn: 'root'
})
export class BookService {
    private BOOKS_URL = `${serverLink}/books`;
    private BOOKS_MOVE_URL = `${this.BOOKS_URL}/move`;
    private BOOKS_DETAILS_URL = `${this.BOOKS_URL}/details`;

    private LOAN_BOOK_URL = `${serverLink}/loans`;

    constructor(
        private http: HttpClient,
        private helperService: HelperService,
        private responseService: ResponseService
    ) {}

    getBooks(data: GetBooks) {
        return this.http
            .get(this.BOOKS_URL, {
                params: new HttpParams()
                    .set('page', data.page.toString())
                    .set('yFrom', data.yearFrom ? data.yearFrom.toString() : '')
                    .set('yTo', data.yearTo ? data.yearTo.toString() : '')
                    .set('author', data.author ? data.author.toString() : '')
                    .set('genre', data.genre ? data.genre.toString() : '')
                    .set('department', data.department ? data.department.toString() : '')
                    .set('filterName', data.filterName)
                    .set('filterValue', data.filterValue)
            })
            .pipe(map((response: any) => response.data));
    }

    getBookHttp(bookId: number) {
        return this.http
            .get(this.BOOKS_DETAILS_URL, {
                params: new HttpParams().set('bookId', bookId.toString())
            })
            .pipe(
                map((response: any) => {
                    // this.setBook(response.data.book);
                })
            );
    }

    addBook(book: Book) {
        const headers = new HttpHeaders();
        const formData: FormData = new FormData();
        headers.append('Content-Type', 'multipart/form-data');
        formData.append('book', JSON.stringify(book));
        return this.http.post(this.BOOKS_URL, formData, { headers }).pipe(map((response: any) => response.data));
    }

    editBookHttp(book: Book, imageToUploadBase64: string) {
        const headers = new HttpHeaders();
        const formData: FormData = new FormData();
        headers.append('Content-Type', 'multipart/form-data');
        return this.http.put(this.BOOKS_URL, formData, { headers }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    deleteBookHttp(bookId: number) {
        return this.http
            .delete(this.BOOKS_URL, {
                params: new HttpParams().set('bookId', bookId.toString())
            })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }

    loanBookHttp(info) {
        return this.http.post(this.LOAN_BOOK_URL, info).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    moveBookHttp(book: Book, departmentId: number, quantity: number) {
        return this.http
            .post(this.BOOKS_MOVE_URL, { book, departmentId, quantity })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
