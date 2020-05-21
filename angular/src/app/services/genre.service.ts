import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Genre } from '../models/genre.model';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class GenreService {
    GENRES_URL = `${serverLink}/genres`;

    genresChanged = new Subject<Genre[]>();
    genres: Genre[] = [];

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setGenres(genres: Genre[]) {
        this.genres = genres;
        this.genresChanged.next(this.genres);
    }

    getGenres() {
        return this.genres;
    }

    fetchAllGenresHttp() {
        return this.http
            .get(`${this.GENRES_URL}`)
            .pipe(
                map((response: any) => {
                    this.setGenres(response.data.genres);
                })
            );
    }

    addGenreHttp(genre: Genre) {
        return this.http.post(this.GENRES_URL, { genre }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    ediGenreHttp(genreId: number, name: string) {
        return this.http
            .put(this.GENRES_URL, { genreId, name })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }

    deleteGenreHttp(genreId: number) {
        return this.http
            .delete(`${this.GENRES_URL}?genreId=${genreId}`)
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
