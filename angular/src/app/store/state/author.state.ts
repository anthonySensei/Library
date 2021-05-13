import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MaterialService } from '../../services/material.service';
import { Injectable } from '@angular/core';
import { SnackBarClasses } from '../../constants/snackBarClasses';
import { StudentStateModel } from '../models/student.model';
import { Author } from '../../models/author.model';
import { AuthorStateModel } from '../models/author.model';
import { AuthorService } from '../../services/author.service';


/*********************************
 *** AuthorActions - Commands ***
 **********************************/
export class InitAuthorState {
    static readonly type = '[Author] InitAuthorState';
}

export class LoadAuthors {
    static readonly type = '[Author] LoadAuthors';

    constructor() {}
}

export class SetAuthors {
    static readonly type = '[Author] SetAuthor';

    constructor(public authors: Author[]) {}
}

export class CreateAuthor {
    static readonly type = '[Author] CreateAuthor';

    constructor(public data: Author) {}
}

export class EditAuthor {
    static readonly type = '[Author] EditAuthor';

    constructor(public authorId: string, public data: Author) {}
}

export class DeleteAuthor {
    static readonly type = '[Author] DeleteAuthor';

    constructor(public id: string) {}
}

/*******************************
 *** AuthorState            ***
 ********************************/
export const STATE_NAME = 'author';

@State<AuthorStateModel>({
    name: STATE_NAME,
    defaults: new AuthorStateModel()
})

@Injectable()
export class AuthorState {
    constructor(
        private authorService: AuthorService,
        private materialService: MaterialService
    ) { }

    /****************
     *** Selectors ***
     *****************/
    @Selector()
    static Authors(state: AuthorStateModel): Author[] {
        return state.authors;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitAuthorState)
    initAuthorState(ctx: StateContext<AuthorStateModel>) {
        return ctx.setState(new AuthorStateModel());
    }

    @Action(LoadAuthors)
    loadAuthors(ctx: StateContext<AuthorStateModel>) {
        return this.authorService.getAuthors().pipe(tap(response => ctx.dispatch(new SetAuthors(response.authors))));
    }

    @Action(SetAuthors)
    setAuthor(ctx: StateContext<AuthorStateModel>, action: SetAuthors) {
        return ctx.patchState({ authors: action.authors });
    }

    @Action(CreateAuthor)
    createAuthor(ctx: StateContext<AuthorStateModel>, action: CreateAuthor) {
        return this.authorService.createAuthor(action.data).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadAuthors());
        }));
    }

    @Action(EditAuthor)
    editAuthor(ctx: StateContext<AuthorStateModel>, action: EditAuthor) {
        const { authorId, data } = action;
        return this.authorService.editAuthor(authorId, data).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadAuthors());
        }));
    }

    @Action(DeleteAuthor)
    deleteAuthor(ctx: StateContext<StudentStateModel>, action: DeleteAuthor) {
        const { id } = action;
        return this.authorService.deleteAuthor(id).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadAuthors());
        }));
    }
}
