import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';

import { AngularLinks } from '../../constants/angularLinks';
import { UserRoles } from '../../constants/userRoles';

import { User } from '../../models/user.model';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit, OnDestroy {
    isLoggedIn = false;
    isSmallScreen = false;

    links = AngularLinks;
    userRoles = UserRoles;

    userChangedSubscription: Subscription;
    breakpointSubscription: Subscription;
    authServiceSubscription: Subscription;

    user: User;

    role: string = null;

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
                this.user = user;
                this.isLoggedIn = !!user;
                if (user) {
                    this.role = this.user.role.role;
                } else {
                    this.role = null;
                }
            }
        );
        this.user = this.authService.getUser();
    }

    onLogoutUser() {
        this.authServiceSubscription = this.authService
            .logout()
            .subscribe(() => {
                this.authService.setIsLoggedIn(false);
                this.router.navigate([AngularLinks.LOGIN]);
            });
    }

    ngOnDestroy(): void {
        this.authServiceSubscription.unsubscribe();
        this.breakpointSubscription.unsubscribe();
        this.userChangedSubscription.unsubscribe();
    }
}
