import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Subscription } from 'rxjs';

import { LibrarianService } from '../../../services/librarian.service';
import { HelperService } from '../../../services/helper.service';

import { Librarian } from '../../../models/librarian.model';
import { Schedule } from '../../../models/schedule.model';

import { PageTitles } from '../../../constants/pageTitles';

@Component({
    selector: 'app-librarian-details',
    templateUrl: './librarian-details.component.html',
    styleUrls: ['./librarian-details.component.sass']
})
export class LibrarianDetailsComponent implements OnInit, OnDestroy {
    schedule: Schedule[];

    librarian: Librarian;
    librarianId: number;

    librarianSubscription: Subscription;
    librarianChangedSubscription: Subscription;

    paramsSubscription: Subscription;

    isLoading: boolean;

    constructor(
        private librarianService: LibrarianService,
        public helperService: HelperService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.LIBRARIAN_DETAILS;
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.librarianId = +params.id;
            }
        );
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.paramsSubscription, [
            this.librarianChangedSubscription,
            this.librarianSubscription
        ]);
    }
}
