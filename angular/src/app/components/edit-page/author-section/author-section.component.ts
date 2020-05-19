import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Subscription } from 'rxjs';

import { Author } from '../../../models/author.model';
import { Response } from '../../../models/response.model';

import { AuthorService } from '../../../services/author.service';
import { ResponseService } from '../../../services/response.service';

import { SnackBarClasses } from '../../../constants/snackBarClasses';

@Component({
    selector: 'app-author-section',
    templateUrl: './author-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class AuthorSectionComponent implements OnInit {
    @Output() onOpenSnackbar = new EventEmitter();
    @Output() onNothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;

    authors: Author[];

    authorsFetchSubscription: Subscription;
    authorsChangeSubscription: Subscription;

    authorSelect = null;
    authorName = null;
    newAuthorName = null;

    response: Response;

    showAuthorAdding = false;

    constructor(private authorService: AuthorService) {}

    ngOnInit() {
        this.authorsFetchSubscription = this.authorService
            .fetchAllAuthorsHttp()
            .subscribe();
        this.authorsChangeSubscription = this.authorService.authorsChanged.subscribe(
            authors => {
                this.authors = authors;
            }
        );
    }

    getAuthor(): Author {
        return this.authors.find(aut => aut.id === this.authorSelect);
    }

    setAuthorName() {
        if (this.authorSelect) {
            this.authorName = this.getAuthor().name;
        }
    }

    addAuthor() {
        this.authorService
            .addAuthorHttp({ id: null, name: this.newAuthorName })
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                this.authorResponseHandler();
            });
    }

    editAuthor() {
        if (!this.authorName) {
            return;
        }
        if (this.authorName === this.getAuthor().name) {
            this.onNothingToChange.emit();
            return;
        }
        this.authorService
            .editAuthorHttp(this.authorSelect, this.authorName)
            .subscribe(() => {
                this.authorResponseHandler();
            });
    }

    deleteAuthor() {
        if (!this.authorSelect) {
            return;
        }
        this.authorName = null;
        this.authorService.deleteAuthorHttp(this.authorSelect).subscribe(() => {
            this.authorResponseHandler();
            this.authorName = null;
            this.authorSelect = null;
        });
    }

    authorResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.authorService.fetchAllAuthorsHttp().subscribe();
            this.authors = this.authorService.getAuthors();
            this.newAuthorName = null;
        } else {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }
}
