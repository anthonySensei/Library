import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Genre } from '../models/genre.model';

import { serverLink } from '../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class GenreService {
    private GENRES_URL = `${serverLink}/genres`;

    constructor(
        private http: HttpClient,
    ) {}

    getGenres() {
        return this.http.get(this.GENRES_URL).pipe(map((response: any) => response.data));
    }

    createGenre(genre: Genre) {
        return this.http.post(this.GENRES_URL, { genre }).pipe(map((response: any) => response.data));
    }

    ediGenre(id: string, name: string) {
        return this.http.put(`${this.GENRES_URL}/${id}`, { name }).pipe(map((response: any) => response.data));
    }

    deleteGenre(id: string) {
        return this.http.delete(`${this.GENRES_URL}/${id}`).pipe(map((response: any) => response.data));
    }
}
