import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Author } from '../models/author.model';
import { UpdateAuthorPayload } from '../models/request/author';

import { serverLink } from '../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class AuthorService {
    private AUTHORS_URL = `${serverLink}/authors`;

    constructor(
        private http: HttpClient
    ) {}

    getAuthors() {
        return this.http.get(this.AUTHORS_URL).pipe(map((response: any) => response.data));
    }

    createAuthor(author: Author) {
        return this.http.post(this.AUTHORS_URL, { author }).pipe(map((response: any) => response.data));
    }

    editAuthor(id: string, author: UpdateAuthorPayload) {
        return this.http.put(`${this.AUTHORS_URL}/${id}`, { author }).pipe(map((response: any) => response.data));
    }

    deleteAuthor(id: string) {
        return this.http.delete(`${this.AUTHORS_URL}/${id}`).pipe(map((response: any) => response.data));
    }
}
