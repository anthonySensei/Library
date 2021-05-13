import { Component, OnDestroy, OnInit } from '@angular/core';

import { Genre } from '../../../models/genre.model';
import { MatDialog } from '@angular/material/dialog';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select, Store } from '@ngxs/store';
import { MatTableDataSource } from '@angular/material/table';
import { DeleteGenre, GenreState } from '../../../store/state/genre.state';
import { Observable } from 'rxjs';
import { GenrePopupComponent } from '../../popups/genre-popup/genre-popup.component';

@Component({
    selector: 'app-genre-section',
    templateUrl: './genre-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class GenreSectionComponent implements OnInit, OnDestroy {

    dataSource = new MatTableDataSource([]);
    displayedColumns: string[] = ['name', 'actions'];

    @Select(GenreState.Genres)
    authors$: Observable<Genre[]>;

    constructor(
        private store: Store,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.getGenres$();
    }

    getGenres$() {
        this.authors$.pipe(untilDestroyed(this)).subscribe(genres => this.dataSource = new MatTableDataSource(genres));
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

    openGenrePopup(data: Genre) {
        this.dialog.open(GenrePopupComponent, { data, disableClose: true, width: `569px`});
    }

    onApplyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    onAddGenre(): void {
        this.openGenrePopup({} as Genre);
    }

    onEditGenre(genre: Genre): void {
        this.openGenrePopup(genre);
    }

    onDeleteGenre(id: string): void {
        this.store.dispatch(new DeleteGenre(id));
    }

    ngOnDestroy(): void {}
}
