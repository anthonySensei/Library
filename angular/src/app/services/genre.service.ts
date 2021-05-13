import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Genre } from '../models/genre.model';
import { Response } from '../models/response.model';

import { serverLink } from '../constants/serverLink';

@Injectable({ providedIn: 'root' })
export class GenreService {
    private GENRES_URL = `${serverLink}/genres`;

    constructor(private http: HttpClient) {}

    getGenres() {
        return this.http.get(this.GENRES_URL).pipe(map((response: Response) => response.data));
    }

    createGenre(genre: Genre) {
        return this.http.post(this.GENRES_URL, { genre }).pipe(map((response: Response) => response.data));
    }

    ediGenre(id: string, genre: Genre) {
        return this.http.put(`${this.GENRES_URL}/${id}`, { genre }).pipe(map((response: Response) => response.data));
    }

    deleteGenre(id: string) {
        return this.http.delete(`${this.GENRES_URL}/${id}`).pipe(map((response: Response) => response.data));
    }
}
