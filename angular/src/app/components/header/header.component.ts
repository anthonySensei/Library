import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { HelperService } from '../../services/helper.service';

import { AngularLinks } from '../../constants/angularLinks';
import { UserRoles } from '../../constants/userRoles';
import { ModalWidth } from '../../constants/modalWidth';

import { User } from '../../models/user.model';

import { MyOrdersModalComponent } from './my-orders-modal/my-orders-modal.component';

import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

    role: string;
    isLoggedIn: boolean;
    isSmallScreen: boolean;
    user: User;
    userRoles = UserRoles;
    links = AngularLinks;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private authService: AuthService,
        private helperService: HelperService,
        private router: Router,
        public dialog: MatDialog
    ) {
        breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(untilDestroyed(this)).subscribe(result => {
            this.isSmallScreen = !!result.matches;
        });
    }

    ngOnInit(): void {
        this.userSubscriptionHandle();
    }

    isNotUser(): boolean {
        return this.role === this.userRoles.MANAGER || this.role === this.userRoles.LIBRARIAN;
    }

    isManager(): boolean {
        return this.role === this.userRoles.MANAGER;
    }

    userSubscriptionHandle(): void {
        this.authService.getUser().pipe(untilDestroyed(this)).subscribe(user => {
            this.user = user;
            this.isLoggedIn = !!user;
            this.role = user ? user.role.role : null;
        });
    }

    openMyOrdersModal(): void {
        this.dialog.open(MyOrdersModalComponent, {
            data: { studentId: this.user.id },
            width: ModalWidth.W70P
        });
    }

    onLogoutUser(): void {
        this.authService.logout().pipe(untilDestroyed(this)).subscribe(() => {
            this.authService.setIsLoggedIn(false);
            this.router.navigate([AngularLinks.LOGIN]);
        });
    }

    ngOnDestroy(): void {}
}
