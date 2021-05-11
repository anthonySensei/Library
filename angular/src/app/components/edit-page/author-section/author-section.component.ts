import { Component, OnDestroy, OnInit } from '@angular/core';

import { Author } from '../../../models/author.model';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/state/user.state';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { AuthorState, DeleteAuthor } from '../../../store/state/author.state';
import { MatTableDataSource } from '@angular/material/table';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { AuthorPopupComponent } from '../../popups/author-popup/author-popup.component';

@Component({
    selector: 'app-author-section',
    templateUrl: './author-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class AuthorSectionComponent implements OnInit, OnDestroy {

    dataSource = new MatTableDataSource([]);
    displayedColumns: string[] = ['name', 'country', 'language', 'actions'];

    @Select(AuthorState.Authors)
    authors$: Observable<Author[]>;

    constructor(
        private store: Store,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.getAuthors$();
    }

    getAuthors$() {
        this.authors$.pipe(untilDestroyed(this)).subscribe(authors => this.dataSource = new MatTableDataSource(authors));
    }

    openConfirmDeleteDialog(): void {
        // const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
        //     width: ModalWidth.W30P
        // });
        //
        // dialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         this.onDeleteAuthor();
        //     }
        // });
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
        this.store.dispatch(new DeleteAuthor(id));
    }

    ngOnDestroy(): void {}
}
