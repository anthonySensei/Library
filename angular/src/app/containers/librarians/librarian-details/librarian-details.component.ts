import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Subscription } from 'rxjs';

import { LibrarianService } from '../../../services/librarian.service';
import { HelperService } from '../../../services/helper.service';

import { Librarian } from '../../../models/librarian.model';
import { Schedule } from '../../../models/schedule.model';

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
        private helperService: HelperService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        document.title = 'Librarian';
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.librarianId = +params.id;
                this.librarianSubscriptionHandle();
            }
        );
    }

    librarianSubscriptionHandle(): void {
        this.librarianSubscription = this.librarianService
            .getLibrarianHttp(this.librarianId)
            .subscribe();
        this.librarianChangedSubscription = this.librarianService
            .getLibrarian()
            .subscribe(librarian => {
                this.librarian = librarian;
                this.schedule = this.librarian.schedule || [];
                this.isLoading = false;
            });
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.paramsSubscription, [
            this.librarianChangedSubscription,
            this.librarianSubscription
        ]);
    }
}
