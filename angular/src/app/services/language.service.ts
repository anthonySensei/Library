import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Author } from '../models/author.model';
import { UpdateAuthorPayload } from '../models/request/author';

import { serverLink } from '../constants/serverLink';
import { Language } from '../models/language.model';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private LANGUAGES_URL = `${serverLink}/languages`;

    constructor(
        private http: HttpClient
    ) {}

    getLanguages() {
        return this.http.get(this.LANGUAGES_URL).pipe(map((response: any) => response.data));
    }

    createLanguage(language: Language) {
        return this.http.post(this.LANGUAGES_URL, { language }).pipe(map((response: any) => response.data));
    }

    editLanguage(id: string, language: Language) {
        return this.http.put(`${this.LANGUAGES_URL}/${id}`, { language }).pipe(map((response: any) => response.data));
    }

    deleteLanguage(id: string) {
        return this.http.delete(`${this.LANGUAGES_URL}/${id}`).pipe(map((response: any) => response.data));
    }
}
