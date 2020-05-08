import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AuthService } from '../../auth/services/auth.service';
import { AngularLinks } from '../../constants/angularLinks';

@Injectable({
    providedIn: 'root'
})
export class ManagerGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isManager().then((manager: boolean) => {
            if (!manager) {
                this.router.navigate([AngularLinks.HOME]);
                return false;
            }
            return manager;
        });
    }
}
