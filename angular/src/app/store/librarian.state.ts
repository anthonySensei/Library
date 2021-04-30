import { Action, Selector, State, StateContext } from '@ngxs/store';
import { User } from '../models/user.model';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { MaterialService } from '../services/material.service';
import { LibrarianStateModel } from './librarian.model';
import { LibrarianService } from '../services/librarian.service';


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

export class SetLibrarian {
    static readonly type = '[Librarian] SetLibrarian';

    constructor(public librarian: User) {}
}

export class SetLibrarians {
    static readonly type = '[Librarian] SetLibrarians';

    constructor(public librarians: User[]) {}
}

/*******************************
 *** UserState            ***
 ********************************/
export const CONTRACT_STATE_NAME = 'librarian';

@State<LibrarianStateModel>({
    name: CONTRACT_STATE_NAME,
    defaults: new LibrarianStateModel()
})

@Injectable()
export class LibrarianState {
    constructor(
        private librarianService: LibrarianService,
        private materialService: MaterialService
    ) { }

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
            const { success, librarian, message } = res;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
            }

            ctx.dispatch(new SetLibrarian(librarian));
        }));
    }

    @Action(LoadLibrarians)
    loadStudents(ctx: StateContext<LibrarianStateModel>, action: LoadLibrarians) {
        const { pageSize, pageNumber, filterValue, sortOrder, sortName } = action;
        return this.librarianService.getLibrarians(filterValue, sortName, sortOrder, pageNumber, pageSize).pipe(tap(res => {
            const { success, librarians, message } = res;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
            }

            ctx.dispatch(new SetLibrarians(librarians));
        }));
    }

    @Action(SetLibrarian)
    setStudent(ctx: StateContext<LibrarianStateModel>, action: SetLibrarian) {
        const { librarian } = action;
        return ctx.patchState({ librarian });
    }

    @Action(SetLibrarians)
    setStudents(ctx: StateContext<LibrarianStateModel>, action: SetLibrarians) {
        const { librarians } = action;
        return ctx.patchState({ librarians });
    }
}
