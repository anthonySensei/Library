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
import { Select, Store } from '@ngxs/store';
import { Logout, UserState } from '../../store/state/user.state';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

    isLoggedIn: boolean;
    isSmallScreen: boolean;
    user: User;
    links = AngularLinks;

    @Select(UserState.User)
    user$: Observable<User>;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private authService: AuthService,
        private helperService: HelperService,
        private router: Router,
        public dialog: MatDialog,
        private store: Store
    ) {
        breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(untilDestroyed(this)).subscribe(result => {
            this.isSmallScreen = !!result.matches;
        });
    }

    ngOnInit(): void {
        this.getUser$();
    }

    isNotUser(): boolean {
        return this.user.admin || this.user.librarian;
    }

    isManager(): boolean {
        return this.user.admin;
    }

    isUser(): boolean {
        return !this.user.admin && this.user.librarian;
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => {
            this.user = user || {} as User;
            this.isLoggedIn = !!user;
        });
    }

    openMyOrdersModal(): void {
        this.dialog.open(MyOrdersModalComponent, {
            data: { studentId: this.user.id },
            width: ModalWidth.W70P
        });
    }

    onLogoutUser(): void {
        this.store.dispatch(new Logout());
    }

    ngOnDestroy(): void {}
}
