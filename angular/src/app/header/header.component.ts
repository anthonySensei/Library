import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';

import { angularLinks } from '../constants/angularLinks';
import { userRoles } from '../constants/userRoles';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit, OnDestroy {
    isLoggedIn = false;
    isSmallScreen = false;

    links = angularLinks;
    userRoles = userRoles;

    userChangedSubscription: Subscription;
    breakpointSubscription: Subscription;
    authServiceSubscription: Subscription;

    user;

    role = userRoles.STUDENT;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private authService: AuthService,
        private router: Router
    ) {
        this.breakpointSubscription = breakpointObserver
            .observe([Breakpoints.Small, Breakpoints.XSmall])
            .subscribe(result => {
                if (result.matches) {
                    this.isSmallScreen = true;
                } else if (!result.matches) {
                    this.isSmallScreen = false;
                }
            });
    }

    ngOnInit() {
        this.userSubscriptionHandle();
    }

    userSubscriptionHandle() {
        this.userChangedSubscription = this.authService.userChanged.subscribe(
            user => {
                this.isLoggedIn = !!user;
                this.user = user;
                if (this.user) {
                    this.role = this.user.role.role;
                } else {
                    this.role = userRoles.STUDENT;
                }
            }
        );
    }

    onLogoutUser() {
        this.authServiceSubscription = this.authService
            .logout()
            .subscribe(() => {
                this.authService.setIsLoggedIn(false);
                this.router.navigate([angularLinks.LOGIN]);
            });
    }

    ngOnDestroy(): void {
        this.authServiceSubscription.unsubscribe();
        this.breakpointSubscription.unsubscribe();
        this.userChangedSubscription.unsubscribe();
    }
}
