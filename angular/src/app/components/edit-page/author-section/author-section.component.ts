import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Author } from '../../../models/author.model';

import { AuthorService } from '../../../services/author.service';
import { ResponseService } from '../../../services/response.service';
import { HelperService } from '../../../services/helper.service';
import { MatDialog } from '@angular/material/dialog';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-author-section',
    templateUrl: './author-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class AuthorSectionComponent implements OnInit, OnDestroy {
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() helperService: HelperService;

    authors: Author[];

    authorSelect: number;
    authorName: string;
    newAuthorName: string;

    showAuthorAdding: boolean;

    constructor(
        private authorService: AuthorService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.setAuthors();
    }

    setAuthors(): void {
        this.authorService
            .fetchAllAuthorsHttp()
            .pipe(untilDestroyed(this))
            .subscribe();
        this.authorService
            .getAuthors()
            .pipe(untilDestroyed(this))
            .subscribe((authors: Author[]) => {
                this.authors = authors;
            });
    }

    getAuthor(): Author {
        return this.authors.find(aut => aut.id === this.authorSelect);
    }

    setAuthorName(): void {
        if (this.authorSelect) {
            this.authorName = this.getAuthor().name;
        }
    }

    addAuthor(): void {
        this.authorService
            .addAuthorHttp({ id: null, name: this.newAuthorName })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.authorResponseHandler();
            });
    }

    editAuthor(): void {
        if (!this.authorName) {
            return;
        }
        if (this.authorName === this.getAuthor().name) {
            this.nothingToChange.emit();
            return;
        }
        this.authorService
            .editAuthorHttp(this.authorSelect, this.authorName)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.authorResponseHandler();
            });
    }

    openConfirmDeleteDialog(): void {
        // const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
        //     width: ModalWidth.W30P
        // });
        //
        // dialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         this.deleteAuthor();
        //     }
        // });
    }

    deleteAuthor(): void {
        if (!this.authorSelect) {
            return;
        }
        this.authorName = null;
        this.authorService
            .deleteAuthorHttp(this.authorSelect)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.authorResponseHandler();
            });
    }

    authorResponseHandler(): void {
        if (this.responseService.responseHandle()) {
            this.setAuthors();
            this.newAuthorName = null;
            this.authorName = null;
            this.authorSelect = null;
        }
    }

    ngOnDestroy(): void {}
}
