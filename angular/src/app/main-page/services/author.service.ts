import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Author } from '../models/author.model';

@Injectable({
    providedIn: 'root'
})
export class AuthorService {
    AUTHORS_URL = 'http://localhost:3000/authors';

    responseChanged = new Subject();
    response;

    authorsChanged = new Subject<Author[]>();
    authors: Author[] = [];

    constructor(private http: HttpClient) {}

    setAuthors(authors: Author[]) {
        this.authors = authors;
        this.authorsChanged.next(this.authors);
    }

    getAuthors() {
        return this.authors;
    }

    setResponse(response) {
        this.response = response;
        this.responseChanged.next(this.response);
    }
    getResponse() {
        return this.response;
    }

    fetchAllAuthorsHttp() {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.AUTHORS_URL}`, {
                headers
            })
            .pipe(
                map((response: any) => {
                    this.setAuthors(response.data.authors);
                })
            );
    }

    addAuthorHttp(author: Author) {
        return this.http.post(this.AUTHORS_URL, { author }).pipe(
            map((response: any) => {
                this.setResponse(response.data);
            })
        );
    }
}
