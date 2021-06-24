import { Component, Input, OnInit } from '@angular/core';
import { Book } from '../../../../models/book.model';
import { AngularLinks } from '../../../../constants/angularLinks';
import { Select } from '@ngxs/store';
import { BookState } from '../../../../store/state/book.state';
import { Observable } from 'rxjs';
import { Author } from '../../../../models/author.model';
import { Genre } from '../../../../models/genre.model';
import { LocalizationService } from '../../../../services/localization.service';

@Component({
    selector: 'app-books-list',
    templateUrl: './books-list.component.html',
    styleUrls: ['./books-list.component.scss']
})
export class BooksListComponent implements OnInit {

    links = AngularLinks;
    booksLoaded: string[] = [];

    @Select(BookState.Books)
    books$: Observable<Book[]>;

    constructor(
        private localizationService: LocalizationService
    ) {}

    ngOnInit() {}

    isBookLoaded(id: string): boolean {
        return this.booksLoaded.includes(id);
    }

    getAuthors(authors: Author[]): string {
        return authors.map(author => author.name).join(', ');
    }

    getGenres(genres: Genre[]): string {
        return genres.map(genre => genre.name).join(', ');
    }

    getLanguage(code: string): string {
       return this.localizationService.getLanguageName(code);
    }

    onLoad(id: string) {
        this.booksLoaded.push(id);
    }
}
