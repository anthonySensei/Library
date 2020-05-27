import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ResponseService } from '../../../services/response.service';

import { AngularLinks } from '../../../constants/angularLinks';
import { PageTitles } from '../../../constants/pageTitles';

@Component({
    selector: 'app-activation-page',
    templateUrl: './activation-page.component.html'
})
export class ActivationPageComponent implements OnInit, OnDestroy {
    registrationToken: string;

    paramsSubscription: Subscription;
    authSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private responseService: ResponseService,
        private router: Router
    ) {}

    ngOnInit() {
        document.title = PageTitles.ACTIVATION_PAGE;
        this.paramsSubscription = this.route.queryParams.subscribe(
            (params: Params) => {
                this.registrationToken = params.rtoken;
            }
        );
        this.subscriptionHandle();
    }

    subscriptionHandle() {
        this.authSubscription = this.authService
            .checkRegistrationToken(this.registrationToken)
            .subscribe(() => {
                if (this.responseService.responseHandle()) {
                    this.router.navigate(['/' + AngularLinks.LOGIN]);
                }
            });
    }

    ngOnDestroy(): void {
        this.paramsSubscription.unsubscribe();
        this.authSubscription.unsubscribe();
    }
}
