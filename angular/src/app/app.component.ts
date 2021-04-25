import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Store } from '@ngxs/store';
import { AutoLogin, InitUserState } from './store/user.state';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private authService: AuthService, private store: Store) {}

    ngOnInit(): void {
        this.store.dispatch([new InitUserState(), new AutoLogin()]);
    }
}
