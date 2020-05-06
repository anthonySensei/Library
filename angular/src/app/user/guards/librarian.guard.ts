import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AuthService } from '../../auth/services/auth.service';

import { angularLinks } from '../../constants/angularLinks';

@Injectable({
    providedIn: 'root'
})
export class LibrarianGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isLibrarian().then((librarian: boolean) => {
            if (!librarian) {
                this.router.navigate([angularLinks.HOME]);
                return false;
            }
            return librarian;
        });
    }
}
