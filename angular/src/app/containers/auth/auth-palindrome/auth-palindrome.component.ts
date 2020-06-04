import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-auth-palindrome',
    templateUrl: './auth-palindrome.component.html'
})
export class AuthPalindromeComponent implements OnInit, OnDestroy {
    paramsSubscription: Subscription;
    palindromeSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.paramsSubscription = this.route.queryParams.subscribe(
            (params: Params) => {
                this.palindromeSubscription = this.authService
                    .loginWithPalindrome(params.token)
                    .subscribe();
            }
        );
    }

    ngOnDestroy(): void {
        this.paramsSubscription.add(this.palindromeSubscription);
        this.paramsSubscription.unsubscribe();
    }
}
