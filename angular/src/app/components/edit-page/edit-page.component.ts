import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable } from 'rxjs';


import { MaterialService } from '../../services/material.service';

import { AuthService } from '../../services/auth.service';
import { LibrarianService } from '../../services/librarian.service';
import { PageTitles } from '../../constants/pageTitles';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../store/state/user.state';
import { User } from '../../models/user.model';
import { LoadAuthors } from '../../store/state/author.state';
import { LoadGenres } from '../../store/state/genre.state';

@Component({
    selector: 'app-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.sass']
})
export class EditPageComponent implements OnInit, OnDestroy {

    isManager: boolean;

    @Select(UserState.User)
    user$: Observable<User>;

    constructor(
        private authService: AuthService,
        private materialService: MaterialService,
        public librarianService: LibrarianService,
        private store: Store
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.MANAGING;
        this.getUser$();
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.isManager = user && user.admin);
    }

    onLoadAuthors() {
        this.store.dispatch(new LoadAuthors());
    }

    onLoadGenres() {
        this.store.dispatch(new LoadGenres());
    }

    ngOnDestroy(): void {}
}
