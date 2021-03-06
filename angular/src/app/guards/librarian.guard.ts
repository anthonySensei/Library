import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AngularLinks } from '../constants/angularLinks';
import { UserState } from '../store/state/user.state';
import { Store } from '@ngxs/store';

@Injectable({
    providedIn: 'root'
})
export class LibrarianGuard implements CanActivate {
    constructor(private store: Store, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const user = this.store.selectSnapshot(UserState.User);
        const isHasAccess = user.librarian || user.admin;

        if (!isHasAccess) {
            this.router.navigate([AngularLinks.HOME]);
            return isHasAccess;
        }

        return isHasAccess;
    }
}
