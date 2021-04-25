import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { AngularLinks } from '../constants/angularLinks';
import { UserState } from '../store/user.state';
import { Store } from '@ngxs/store';

@Injectable({
    providedIn: 'root'
})
export class ManagerGuard implements CanActivate {
    constructor(private store: Store, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const user = this.store.selectSnapshot(UserState.User);
        const isManager = user.admin;

        if (!isManager) {
            this.router.navigate([AngularLinks.HOME]);
            return isManager;
        }

        return isManager;
    }
}
