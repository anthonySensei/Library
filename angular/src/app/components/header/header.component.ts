import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { HelperService } from '../../services/helper.service';

import { AngularLinks } from '../../constants/angularLinks';
import { UserRoles } from '../../constants/userRoles';

import { User } from '../../models/user.model';
import { AddOptionModalComponent } from '../../containers/main-page/add-book/add-option-modal/add-option-modal.component';
import { MyOrdersModalComponent } from './my-orders-modal/my-orders-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit, OnDestroy {
    isLoggedIn: boolean;
    isSmallScreen: boolean;

    links = AngularLinks;

    userSubscription: Subscription;
    breakpointSubscription: Subscription;
    authServiceSubscription: Subscription;

    user: User;

    isManager: boolean;
    isLibrarian: boolean;
    isStudent: boolean;
    openMyOrdersModalWidth = '70%';

    constructor(
        private breakpointObserver: BreakpointObserver,
        private authService: AuthService,
        private helperService: HelperService,
        private router: Router,
        public dialog: MatDialog
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
                const role = user.role.role;
                if (role === UserRoles.MANAGER) {
                    this.isManager = true;
                } else if (role === UserRoles.LIBRARIAN) {
                    this.isLibrarian = true;
                } else if (role === UserRoles.STUDENT) {
                    this.isStudent = true;
                }
            }
        });
    }

    openMyOrdersModal(): void {
        const dialogRef = this.dialog.open(MyOrdersModalComponent, {
            width: this.openMyOrdersModalWidth,
            data: {
                studentId: this.user.id
            }
        });

        dialogRef.afterClosed().subscribe();
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
