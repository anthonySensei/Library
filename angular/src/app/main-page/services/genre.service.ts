import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Genre } from '../models/genre.model';

import { ResponseService } from '../../shared/services/response.service';

import { serverLink } from '../../constants/serverLink';

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
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.GENRES_URL}`, {
                headers
            })
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
}
