import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

import { Subscription } from 'rxjs';

import { ResponseService } from '../../../services/response.service';
import { GenreService } from '../../../services/genre.service';

import { Response } from '../../../models/response.model';
import { Genre } from '../../../models/genre.model';

import { SnackBarClasses } from '../../../constants/snackBarClasses';

@Component({
    selector: 'app-genre-section',
    templateUrl: './genre-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class GenreSectionComponent implements OnInit, OnDestroy {
    @Output() openSnackbar = new EventEmitter();
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;

    genres: Genre[];

    genresSubscription: Subscription;
    genresFetchSubscription: Subscription;
    genresAddSubscription: Subscription;
    genresEditSubscription: Subscription;
    genresDeleteSubscription: Subscription;

    genreSelect: number = null;
    genreName: string = null;
    newGenreName: string = null;

    showGenreAdding: boolean;

    response: Response;

    constructor(private genreService: GenreService) {}

    ngOnInit(): void {
        this.setGenres();
    }

    setGenres() {
        this.genresFetchSubscription = this.genreService
            .fetchAllGenresHttp()
            .subscribe();
        this.genresSubscription = this.genreService.getGenres().subscribe(
            genres => {
                this.genres = genres;
            }
        );
    }

    getGenre(): Genre {
        return this.genres.find(gen => gen.id === this.genreSelect);
    }

    setGenreName(): void {
        if (this.genreSelect) {
            this.genreName = this.getGenre().name;
        }
    }

    addGenre(): void {
        this.genresAddSubscription = this.genreService
            .addGenreHttp({ id: null, name: this.newGenreName })
            .subscribe(() => {
                this.genreResponseHandler();
            });
    }

    editGenre(): void {
        if (!this.genreName) {
            return;
        }
        if (this.genreName === this.getGenre().name) {
            this.nothingToChange.emit();
            return;
        }
        this.genresEditSubscription = this.genreService
            .ediGenreHttp(this.genreSelect, this.genreName)
            .subscribe(() => {
                this.genreResponseHandler();
            });
    }

    deleteGenre(): void {
        if (!this.genreSelect) {
            return;
        }
        this.genresDeleteSubscription = this.genreService
            .deleteGenreHttp(this.genreSelect)
            .subscribe(() => {
                this.genreResponseHandler();
            });
    }

    genreResponseHandler(): void {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.setGenres();
            this.newGenreName = null;
            this.genreName = null;
            this.genreSelect = null;
        } else {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    ngOnDestroy(): void {
        this.genresSubscription.add(this.genresFetchSubscription);
        this.genresSubscription.add(this.genresAddSubscription);
        this.genresSubscription.add(this.genresEditSubscription);
        this.genresSubscription.add(this.genresDeleteSubscription);
        this.genresFetchSubscription.unsubscribe();
    }
}
