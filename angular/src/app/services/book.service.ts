import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { Book } from '../models/book.model';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class BookService {
    private BOOKS_URL = `${serverLink}/books`;
    private BOOKS_ISBN_URL = `${this.BOOKS_URL}/isbn`;
    private BOOKS_MOVE_URL = `${this.BOOKS_URL}/move`;
    private BOOKS_DETAILS_URL = `${this.BOOKS_URL}/details`;

    private LOAN_BOOK_URL = `${serverLink}/loans`;

    private books = new Subject<Book[]>();

    private book = new Subject<Book>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setBooks(books: Book[]): void {
        this.books.next(books);
    }

    getBooks(): Observable<Book[]> {
        return this.books;
    }

    setBook(book: Book): void {
        this.book.next(book);
    }

    getBook(): Observable<Book> {
        return this.book;
    }

    fetchAllBooksHttp(
        page: number,
        author: number,
        genre: number,
        department: number,
        yearFrom: number,
        yearTo: number,
        filterName: string,
        filterValue: string
    ) {
        return this.http
            .get(
                `${this.BOOKS_URL}?page=${page}` +
                    `&yFrom=${yearFrom}` +
                    `&yTo=${yearTo}` +
                    `&author=${author}` +
                    `&genre=${genre}` +
                    `&department=${department}` +
                    `&filterName=${filterName}` +
                    `&filterValue=${filterValue}`
            )
            .pipe(
                map((response: any) => {
                    this.setBooks(response.data.books);
                })
            );
    }

    fetchBooksISBNsHttp() {
        return this.http.get(this.BOOKS_ISBN_URL).pipe(
            map((response: any) => {
                this.setBooks(response.data.books);
            })
        );
    }

    getBookHttp(bookId: number) {
        return this.http.get(`${this.BOOKS_DETAILS_URL}?bookId=${bookId}`).pipe(
            map((response: any) => {
                this.setBook(response.data.book);
            })
        );
    }

    addBookHttp(book: Book, imageToUploadBase64: string) {
        const headers = new HttpHeaders();
        const formData: FormData = new FormData();
        headers.append('Content-Type', 'multipart/form-data');
        formData.append('base64', imageToUploadBase64);
        formData.append('book_data', JSON.stringify(book));
        return this.http.post(this.BOOKS_URL, formData, { headers }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    editBookHttp(book: Book, imageToUploadBase64: string) {
        const headers = new HttpHeaders();
        const formData: FormData = new FormData();
        headers.append('Content-Type', 'multipart/form-data');
        formData.append(
            'base64',
            JSON.stringify({ image: imageToUploadBase64 })
        );
        formData.append('book_data', JSON.stringify(book));
        return this.http.put(this.BOOKS_URL, formData, { headers }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }
    deleteBookHttp(bookId: number) {
        return this.http.delete(`${this.BOOKS_URL}?bookId=${bookId}`).pipe(
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
