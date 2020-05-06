import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Book } from '../../models/book.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
    selector: 'app-unchecked-posts',
    templateUrl: './order-request.component.html',
    styleUrls: ['../main-page/main-page.component.sass'],
})
export class OrderRequestComponent implements OnInit, OnDestroy {

    paramsSubscription: Subscription;

    isLoading: boolean;

    selected = 'unconfirmed';

    currentPage = 1;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.isLoading = true;
        this.paramsSubscription = this.route.queryParams.subscribe(
            (params: Params) => {
                this.currentPage = +params.page || 1;
                this.selected = params.status || 'unconfirmed';
            }
        );
    }

    ngOnDestroy(): void {
        this.paramsSubscription.unsubscribe();
    }
}
