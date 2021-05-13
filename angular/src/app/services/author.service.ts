import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Author } from '../models/author.model';

import { serverLink } from '../constants/serverLink';
import { Response } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class AuthorService {
    private AUTHORS_URL = `${serverLink}/authors`;

    constructor(private http: HttpClient) {}

    getAuthors() {
        return this.http.get(this.AUTHORS_URL).pipe(map((response: Response) => response.data));
    }

    createAuthor(author: Author) {
        return this.http.post(this.AUTHORS_URL, { author }).pipe(map((response: Response) => response.data));
    }

    editAuthor(id: string, author: Author) {
        return this.http.put(`${this.AUTHORS_URL}/${id}`, { author }).pipe(map((response: Response) => response.data));
    }

    deleteAuthor(id: string) {
        return this.http.delete(`${this.AUTHORS_URL}/${id}`).pipe(map((response: Response) => response.data));
    }
}
