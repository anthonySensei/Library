import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

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
export class AuthorSectionComponent implements OnInit, OnDestroy {
    @Output() openSnackbar = new EventEmitter();
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;

    authors: Author[];

    authorsSubscription: Subscription;
    authorsFetchSubscription: Subscription;
    authorsAddSubscription: Subscription;
    authorsEditSubscription: Subscription;
    authorsDeleteSubscription: Subscription;

    authorSelect: number;
    authorName: string;
    newAuthorName: string;

    response: Response;

    showAuthorAdding: boolean;

    constructor(private authorService: AuthorService) {}

    ngOnInit(): void {
        this.setAuthors();
    }

    setAuthors(): void {
        this.authorsFetchSubscription = this.authorService
            .fetchAllAuthorsHttp()
            .subscribe();
        this.authorsSubscription = this.authorService
            .getAuthors()
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
        this.authorsAddSubscription = this.authorService
            .addAuthorHttp({ id: null, name: this.newAuthorName })
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
        this.authorsEditSubscription = this.authorService
            .editAuthorHttp(this.authorSelect, this.authorName)
            .subscribe(() => {
                this.authorResponseHandler();
            });
    }

    deleteAuthor(): void {
        if (!this.authorSelect) {
            return;
        }
        this.authorName = null;
        this.authorsDeleteSubscription = this.authorService
            .deleteAuthorHttp(this.authorSelect)
            .subscribe(() => {
                this.authorResponseHandler();
            });
    }

    authorResponseHandler(): void {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.setAuthors();
            this.newAuthorName = null;
            this.authorName = null;
            this.authorSelect = null;
        } else {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    ngOnDestroy(): void {
        this.authorsSubscription.add(this.authorsFetchSubscription);
        this.authorsSubscription.add(this.authorsAddSubscription);
        this.authorsSubscription.add(this.authorsEditSubscription);
        this.authorsSubscription.add(this.authorsDeleteSubscription);
        this.authorsSubscription.unsubscribe();
    }
}
