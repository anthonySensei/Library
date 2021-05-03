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
import { Store } from '@ngxs/store';
import { UserState } from '../store/state/user.state';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private store: Store, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const isAuthenticated = !!this.store.selectSnapshot(UserState.User);

        if (!isAuthenticated) {
            this.router.navigate(['/' + AngularLinks.LOGIN]);
            return isAuthenticated;
        }

        return isAuthenticated;
    }
}
