import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { Author } from '../models/author.model';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class AuthorService {
    private AUTHORS_URL = `${serverLink}/authors`;

    private authors = new Subject<Author[]>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setAuthors(authors: Author[]): void {
        this.authors.next(authors);
    }

    getAuthors(): Observable<Author[]> {
        return this.authors;
    }

    fetchAllAuthorsHttp() {
        return this.http
            .get(`${this.AUTHORS_URL}`)
            .pipe(
                map((response: any) => {
                    this.setAuthors(response.data.authors);
                })
            );
    }

    addAuthorHttp(author: Author) {
        return this.http.post(this.AUTHORS_URL, { author }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }
    editAuthorHttp(authorId: number, name: string) {
        return this.http.put(this.AUTHORS_URL, { name, authorId }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }
    deleteAuthorHttp(authorId: number) {
        return this.http
            .delete(`${this.AUTHORS_URL}?authorId=${authorId}`)
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
