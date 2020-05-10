import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Book } from '../models/book.model';

@Injectable({
    providedIn: 'root'
})
export class BookService {
    BOOK_DETAILS_URL = 'http://localhost:3000/book-details';
    BOOKS_URL = 'http://localhost:3000/books';

    LOAN_BOOK_URL = 'http://localhost:3000/loan-book';

    responseChanged = new Subject();
    response;

    booksChanged = new Subject<Book[]>();
    books: Book[] = [];

    bookChanged = new Subject<Book>();
    book: Book;

    constructor(private http: HttpClient) {}

    setBooks(books: Book[]) {
        this.books = books;
        this.booksChanged.next(books);
    }

    getBooks() {
        return this.books;
    }

    setBook(book: Book) {
        this.book = book;
        this.bookChanged.next(book);
    }

    getBook() {
        return this.book;
    }

    setResponse(response) {
        this.response = response;
        this.responseChanged.next(this.response);
    }
    getResponse() {
        return this.response;
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

    getBookHttp(bookId: number) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.BOOK_DETAILS_URL}?bookId=${bookId}`, { headers })
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
                this.setResponse(response.data);
            })
        );
    }

    loanBookHttp(info) {
        return this.http
            .post(this.LOAN_BOOK_URL, info)
            .pipe(map(response => {}));
    }
}
