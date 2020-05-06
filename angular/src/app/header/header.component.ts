import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../auth/services/auth.service';

import { angularLinks } from '../constants/angularLinks';
import { userRoles } from '../constants/userRoles';
import { Librarian } from '../user/models/librarian.model';
import { User } from '../auth/models/user.model';

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
                    if (user.readerTicket) {
                        this.role = userRoles.STUDENT;
                    } else {
                        this.role = user.role.role;
                    }
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
                this.router.navigate([angularLinks.LOGIN]);
            });
    }

    ngOnDestroy(): void {
        this.authServiceSubscription.unsubscribe();
        this.breakpointSubscription.unsubscribe();
        this.userChangedSubscription.unsubscribe();
    }
}
