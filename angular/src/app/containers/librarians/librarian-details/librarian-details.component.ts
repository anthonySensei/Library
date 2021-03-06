import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Observable } from 'rxjs';

import { LibrarianService } from '../../../services/librarian.service';

import { PageTitles } from '../../../constants/pageTitles';
import { Select, Store } from '@ngxs/store';
import { User } from '../../../models/user.model';
import { LibrarianState, LoadLibrarian } from '../../../store/state/librarian.state';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { LoadStatistic } from '../../../store/state/book.state';

@Component({
    selector: 'app-librarian-details',
    templateUrl: './librarian-details.component.html',
    styleUrls: ['./librarian-details.component.scss']
})
export class LibrarianDetailsComponent implements OnInit, OnDestroy {
    isLoading: boolean;

    @Select(LibrarianState.Librarian)
    librarian$: Observable<User>;

    constructor(
        private librarianService: LibrarianService,
        private route: ActivatedRoute,
        private store: Store
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.LIBRARIAN_DETAILS;
        this.isLoading = true;
        this.route.params.pipe(untilDestroyed(this)).subscribe((params: Params) => {
            this.store.dispatch(new LoadLibrarian(params.id)).pipe(untilDestroyed(this));
            this.getLibrarian$();
        });
    }

    getLibrarian$() {
        this.librarian$.pipe(untilDestroyed(this)).subscribe(librarian => {
            if (!librarian) {
                return;
            }

            this.isLoading = false;
            this.store.dispatch(new LoadStatistic('librarian', librarian.email));
        });
    }

    ngOnDestroy(): void {}
}
