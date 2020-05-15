import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Book } from '../models/book.model';

import { ResponseService } from '../../shared/services/response.service';

import { serverLink } from '../../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class BookService {
    BOOKS_URL = `${serverLink}/books`;
    BOOKS_ISBN_URL = `${this.BOOKS_URL}/isbn`;
    BOOKS_DETAILS_URL = `${this.BOOKS_URL}/details`;

    LOAN_BOOK_URL = `${serverLink}/loans`;

    booksChanged = new Subject<Book[]>();
    books: Book[] = [];

    bookChanged = new Subject<Book>();
    book: Book;

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setBooks(books: Book[]) {
        this.books = books;
        this.booksChanged.next(books);
    }

    getBooks(): Book[] {
        return this.books;
    }

    setBook(book: Book) {
        this.book = book;
        this.bookChanged.next(book);
    }

    getBook(): Book {
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
        filterValue: number
    ) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(
                `${this.BOOKS_URL}?page=${page}` +
                    `&yFrom=${yearFrom}` +
                    `&yTo=${yearTo}` +
                    `&author=${author}` +
                    `&genre=${genre}` +
                    `&department=${department}` +
                    `&filterName=${filterName}` +
                    `&filterValue=${filterValue}`,
                {
                    headers
                }
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
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.BOOKS_DETAILS_URL}?bookId=${bookId}`, { headers })
            .pipe(
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

    loanBookHttp(info) {
        return this.http.post(this.LOAN_BOOK_URL, info).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }
}
