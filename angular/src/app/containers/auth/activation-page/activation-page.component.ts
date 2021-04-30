import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ResponseService } from '../../../services/response.service';

import { AngularLinks } from '../../../constants/angularLinks';
import { PageTitles } from '../../../constants/pageTitles';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Store } from '@ngxs/store';
import { CheckActivationToken } from '../../../store/user.state';

@Component({
    selector: 'app-activation-page',
    templateUrl: './activation-page.component.html'
})
export class ActivationPageComponent implements OnInit, OnDestroy {
    message = 'Account activation...';

    constructor(
        private route: ActivatedRoute,
        private store: Store
    ) {}

    ngOnInit() {
        document.title = PageTitles.ACTIVATION_PAGE;
        this.route.queryParams.pipe(untilDestroyed(this)).subscribe((params: Params) =>
            this.store.dispatch(new CheckActivationToken(params.token)).subscribe(() => this.message = 'Please try again...')
        );
    }

    ngOnDestroy(): void {}
}
