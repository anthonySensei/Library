import { Action, Selector, State, StateContext } from '@ngxs/store';
import { User } from '../../models/user.model';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { LibrarianStateModel } from '../models/librarian.model';
import { LibrarianService } from '../../services/librarian.service';


/*********************************
 *** UserActions - Commands ***
 **********************************/
export class InitLibrarianState {
    static readonly type = '[Librarian] InitLibrarianState';
}

export class LoadLibrarian {
    static readonly type = '[Librarian] LoadLibrarian';

    constructor(public id: string) {}
}

export class LoadLibrarians {
    static readonly type = '[Librarian] LoadLibrarians';

    constructor(
        public filterValue: string = '',
        public sortName: string = 'name',
        public sortOrder = 'asc',
        public pageNumber = 0,
        public pageSize = 5
    ) {}
}

/*******************************
 *** UserState            ***
 ********************************/
export const STATE_NAME = 'librarian';

@State<LibrarianStateModel>({
    name: STATE_NAME,
    defaults: new LibrarianStateModel()
})

@Injectable()
export class LibrarianState {

    constructor(private librarianService: LibrarianService) { }

    /****************
     *** Selectors ***
     *****************/
    @Selector()
    static Librarian(state: LibrarianStateModel): User {
        return state.librarian;
    }

    @Selector()
    static Librarians(state: LibrarianStateModel): User[] {
        return state.librarians;
    }

    @Selector()
    static LibrariansTotalItems(state: LibrarianStateModel): number {
        return state.librariansTotalItems;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitLibrarianState)
    initUserState(ctx: StateContext<LibrarianStateModel>) {
        ctx.setState(new LibrarianStateModel());
        return ctx;
    }

    @Action(LoadLibrarian)
    loadStudent(ctx: StateContext<LibrarianStateModel>, action: LoadLibrarian) {
        const { id } = action;
        return this.librarianService.getLibrarian(id).pipe(tap(res => {
            ctx.patchState({ librarian: res.librarian });
        }));
    }

    @Action(LoadLibrarians)
    loadStudents(ctx: StateContext<LibrarianStateModel>, action: LoadLibrarians) {
        const { pageSize, pageNumber, filterValue, sortOrder, sortName } = action;
        return this.librarianService.getLibrarians(filterValue, sortName, sortOrder, pageNumber, pageSize).pipe(tap(res => {
            ctx.patchState({ librarians: res.librarians, librariansTotalItems: res.quantity });
        }));
    }
}
