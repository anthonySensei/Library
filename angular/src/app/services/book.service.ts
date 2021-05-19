import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Book } from '../models/book.model';
import { Response } from '../models/response.model';
import { GetLoans } from '../models/request/loan';
import { GetBooksModel, LoanBookModel } from '../models/request/book';

import { serverLink } from '../constants/serverLink';
import { GetOrders } from '../models/order.model';


@Injectable({ providedIn: 'root' })
export class BookService {
    private BOOKS_URL = `${serverLink}/books`;
    private LOANS_URL = `${serverLink}/loans`;
    private ORDERS_URL = `${serverLink}/orders`;
    private STATISTIC_URL = `${this.LOANS_URL}/statistic`;
    private SUMMARY_STATISTIC_URL = `${this.STATISTIC_URL}/summary`;

    constructor(private http: HttpClient) {}

    getBooks(params: GetBooksModel) {
        return this.http
            .get(this.BOOKS_URL, {
                params: new HttpParams()
                    .set('page', params.page.toString())
                    .set('pageSize', params.pageSize.toString())
                    .set('yFrom', params.yearFrom ? params.yearFrom.toString() : '')
                    .set('yTo', params.yearTo ? params.yearTo.toString() : '')
                    .set('authors', params.authors?.length ? params.authors.join(',') : '')
                    .set('genres', params.genres?.length ? params.genres.join(',') : '')
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
                    .set('loanedAt', params.loanedAt?.toString() || '')
                    .set('sortName', params.sortName)
                    .set('sortOrder', params.sortOrder)
                    .set('filterValue', params.filterValue || '')
                    .set('showOnlyDebtors', params.showOnlyDebtors ? 'true' : '')
                    .set('showOnlyReturned', params.showOnlyReturned ? 'true' : '')
            })
            .pipe(map((response: Response) => response.data));
    }

    loanBook(data: LoanBookModel) {
        return this.http.post(this.LOANS_URL, data).pipe(map((response: Response) => response.data));
    }

    returnBook(loanId: string) {
        return this.http.patch(`${this.LOANS_URL}/${loanId}`, {}).pipe(map((response: Response) => response.data));
    }

    getUserStatistic(email: string) {
        return this.http.get(`${this.STATISTIC_URL}/user?email=${email}`).pipe(map((response: Response) => response.data));
    }

    getLibrarianStatistic(email: string) {
        return this.http.get(`${this.STATISTIC_URL}/librarian?email=${email}`).pipe(map((response: Response) => response.data));
    }

    getBookStatistic(isbn: string) {
        return this.http.get(`${this.STATISTIC_URL}/book?isbn=${isbn}`).pipe(map((response: Response) => response.data));
    }

    getSummaryStatistic() {
        return this.http.get(this.SUMMARY_STATISTIC_URL).pipe(map((response: Response) => response.data));
    }

    getOrders(params: GetOrders) {
        return this.http
            .get(this.ORDERS_URL, {
                params: new HttpParams()
                    .set('page', params.page.toString())
                    .set('pageSize', params.pageSize.toString())
                    .set('loanedAt', params.loanedAt?.toString() || '')
                    .set('sortName', params.sortName)
                    .set('sortOrder', params.sortOrder)
                    .set('filterValue', params.filterValue || '')
                    .set('showOnlyLoaned', params.showOnlyLoaned ? 'true' : '')
                    .set('showOnlyNotLoaned', params.showOnlyNotLoaned ? 'true' : '')
            })
            .pipe(map((response: Response) => response.data));
    }
}
