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
import { HelperService } from '../../../services/helper.service';

import { Genre } from '../../../models/genre.model';
import { ModalWidth } from '../../../constants/modalWidth';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-genre-section',
    templateUrl: './genre-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class GenreSectionComponent implements OnInit, OnDestroy {
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() helperService: HelperService;

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

    constructor(
        private genreService: GenreService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.setGenres();
    }

    setGenres() {
        this.genresFetchSubscription = this.genreService
            .fetchAllGenresHttp()
            .subscribe();
        this.genresSubscription = this.genreService
            .getGenres()
            .subscribe((genres: Genre[]) => {
                this.genres = genres;
            });
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

    openConfirmDeleteDialog(): void {
        // const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
        //     width: ModalWidth.W30P
        // });
        //
        // dialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         this.deleteGenre();
        //     }
        // });
    }

    genreResponseHandler(): void {
        if (this.responseService.responseHandle()) {
            this.setGenres();
            this.newGenreName = null;
            this.genreName = null;
            this.genreSelect = null;
        }
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.genresSubscription, [
            this.genresFetchSubscription,
            this.genresAddSubscription,
            this.genresEditSubscription,
            this.genresDeleteSubscription
        ]);
    }
}
