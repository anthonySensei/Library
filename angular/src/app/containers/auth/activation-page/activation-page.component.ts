import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { MaterialService } from '../../../services/material.service';
import { ResponseService } from '../../../services/response.service';

import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { AngularLinks } from '../../../constants/angularLinks';
import { Response } from '../../../models/response.model';

@Component({
    selector: 'app-activation-page',
    templateUrl: './activation-page.component.html'
})
export class ActivationPageComponent implements OnInit, OnDestroy {
    registrationToken: string;

    paramsSubscription: Subscription;
    authSubscription: Subscription;

    response: Response;

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private responseService: ResponseService,
        private router: Router,
        private materialService: MaterialService
    ) {}

    ngOnInit() {
        document.title = 'Activation page';
        this.paramsSubscription = this.route.queryParams.subscribe(params => {
            this.registrationToken = params.rtoken;
        });
        this.subscriptionHandle();
    }

    subscriptionHandle() {
        this.authSubscription = this.authService
            .checkRegistrationToken(this.registrationToken)
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                if (this.response.isSuccessful) {
                    this.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        5000
                    );
                    this.router.navigate(['/' + AngularLinks.LOGIN]);
                } else {
                    this.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Danger,
                        5000
                    );
                }
            });
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    ngOnDestroy(): void {
        this.paramsSubscription.unsubscribe();
        this.authSubscription.unsubscribe();
    }
}
