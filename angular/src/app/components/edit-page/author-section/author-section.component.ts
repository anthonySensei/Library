import { Component, OnDestroy, OnInit } from '@angular/core';

import { Author } from '../../../models/author.model';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorState, DeleteAuthor } from '../../../store/state/author.state';
import { MatTableDataSource } from '@angular/material/table';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { AuthorPopupComponent } from '../../popups/author-popup/author-popup.component';
import { LocalizationService } from '../../../services/localization.service';
import {ConfirmPopupComponent} from '@shared/confirm-popup/confirm-popup.component';

@Component({
    selector: 'app-author-section',
    templateUrl: './author-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class AuthorSectionComponent implements OnInit, OnDestroy {

    dataSource = new MatTableDataSource([]);
    displayedColumns: string[] = ['name', 'country', 'actions'];

    @Select(AuthorState.Authors)
    authors$: Observable<Author[]>;

    constructor(
        private store: Store,
        private dialog: MatDialog,
        private localizationService: LocalizationService
    ) {}

    ngOnInit(): void {
        this.getAuthors$();
    }

    getAuthors$() {
        this.authors$.pipe(untilDestroyed(this)).subscribe(authors => this.dataSource = new MatTableDataSource(authors));
    }

    getCountry(countryCode: string): string {
        return this.localizationService.getCountryName(countryCode);
    }

    getLanguage(languageCode: string): string {
        return this.localizationService.getLanguageName(languageCode);
    }

    openAuthorPopup(data: Author) {
        this.dialog.open(AuthorPopupComponent, {data, disableClose: true, width: `569px`});
    }

    onApplyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    onAddAuthor(): void {
        this.openAuthorPopup({} as Author);
    }

    onEditAuthor(author: Author): void {
        this.openAuthorPopup(author);
    }

    onDeleteAuthor(id: string): void {
        const author = this.store.selectSnapshot(AuthorState.Authors).find(a => a._id === id);
        const dialogRef = this.dialog.open(ConfirmPopupComponent, {
            data: { title: 'Delete Author', text: 'Are you sure you want to delete this author: ', entity: author.name },
            width: '468px'
        });
        dialogRef.afterClosed().subscribe(result => result && this.store.dispatch(new DeleteAuthor(id)));
    }

    ngOnDestroy(): void {}
}
