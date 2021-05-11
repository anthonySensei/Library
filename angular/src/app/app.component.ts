import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Store } from '@ngxs/store';
import { AutoLogin, InitUserState } from './store/state/user.state';
import { InitStudentState } from './store/state/student.state';
import { InitLibrarianState } from './store/state/librarian.state';
import { InitAuthorState } from './store/state/author.state';
import { InitGenreState } from './store/state/genre.state';
import { InitBookState } from './store/state/book.state';
import { InitLanguageState } from './store/state/language.state';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private authService: AuthService, private store: Store) {}

    ngOnInit(): void {
        this.store.dispatch([
            new InitUserState(),
            new InitStudentState(),
            new InitLibrarianState(),
            new InitAuthorState(),
            new InitGenreState(),
            new InitBookState(),
            new InitLanguageState(),
            new AutoLogin()
        ]);
    }
}
