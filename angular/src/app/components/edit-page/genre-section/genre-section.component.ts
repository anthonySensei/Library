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
    @Output() onOpenSnackbar = new EventEmitter();
    @Output() onNothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;

    genres: Genre[];

    genresFetchSubscription: Subscription;
    genresChangeSubscription: Subscription;

    genreSelect = null;
    genreName = null;
    newGenreName = null;

    showGenreAdding = false;

    response: Response;

    constructor(private genreService: GenreService) {}

    ngOnInit() {
        this.genresFetchSubscription = this.genreService
            .fetchAllGenresHttp()
            .subscribe();
        this.genresChangeSubscription = this.genreService.genresChanged.subscribe(
            genres => {
                this.genres = genres;
            }
        );
    }

    getGenre(): Genre {
        return this.genres.find(gen => gen.id === this.genreSelect);
    }

    setGenreName() {
        if (this.genreSelect) {
            this.genreName = this.getGenre().name;
        }
    }

    addGenre() {
        this.genreService
            .addGenreHttp({ id: null, name: this.newGenreName })
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                this.genreResponseHandler();
            });
    }

    editGenre() {
        if (!this.genreName) {
            return;
        }
        if (this.genreName === this.getGenre().name) {
            this.onNothingToChange.emit();
            return;
        }
        this.genreService
            .ediGenreHttp(this.genreSelect, this.genreName)
            .subscribe(() => {
                this.genreResponseHandler();
            });
    }

    deleteGenre() {
        if (!this.genreSelect) {
            return;
        }
        this.genreService.deleteGenreHttp(this.genreSelect).subscribe(() => {
            this.genreResponseHandler();
            this.genreName = null;
            this.genreSelect = null;
        });
    }

    genreResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.genreService.fetchAllGenresHttp().subscribe();
            this.genres = this.genreService.getGenres();
            this.newGenreName = null;
        } else {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    ngOnDestroy(): void {
        this.genresFetchSubscription.unsubscribe();
        this.genresChangeSubscription.unsubscribe();
    }
}
