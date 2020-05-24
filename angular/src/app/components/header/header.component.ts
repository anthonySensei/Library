import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { HelperService } from '../../services/helper.service';

import { AngularLinks } from '../../constants/angularLinks';
import { UserRoles } from '../../constants/userRoles';

import { User } from '../../models/user.model';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit, OnDestroy {
    isLoggedIn: boolean;
    isSmallScreen: boolean;

    links = AngularLinks;
    userRoles = UserRoles;

    userSubscription: Subscription;
    breakpointSubscription: Subscription;
    authServiceSubscription: Subscription;

    user: User;

    role: string;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private authService: AuthService,
        private helperService: HelperService,
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

    ngOnInit(): void {
        this.userSubscriptionHandle();
    }

    userSubscriptionHandle(): void {
        this.userSubscription = this.authService.getUser().subscribe(user => {
            this.user = user;
            this.isLoggedIn = !!user;
            if (user) {
                this.role = this.user.role.role;
            } else {
                this.role = null;
            }
        });
    }

    onLogoutUser(): void {
        this.authServiceSubscription = this.authService
            .logout()
            .subscribe(() => {
                this.authService.setIsLoggedIn(false);
                this.router.navigate([AngularLinks.LOGIN]);
            });
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.userSubscription, [
            this.authServiceSubscription,
            this.breakpointSubscription
        ]);
    }
}
