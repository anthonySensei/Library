import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MaterialService } from '../../services/material.service';
import { Injectable } from '@angular/core';
import { StudentStateModel } from '../models/student.model';
import { UpdateAuthorPayload } from '../../models/request/author';
import { GenreStateModel } from '../models/genre.model';
import { GenreService } from '../../services/genre.service';
import { Genre } from '../../models/genre.model';


/*********************************
 *** AuthorActions - Commands ***
 **********************************/
export class InitGenreState {
    static readonly type = '[Genre] InitGenreState';
}

export class LoadGenres {
    static readonly type = '[Genre] LoadGenres';

    constructor() {}
}

export class SetGenres {
    static readonly type = '[Genre] SetGenre';

    constructor(public genres: Genre[]) {}
}

export class CreateGenre {
    static readonly type = '[Genre] CreateGenre';

    constructor(public data: UpdateAuthorPayload) {}
}

export class EditGenre {
    static readonly type = '[Genre] EditGenre';

    constructor(public data: UpdateAuthorPayload, public authorId?: string) {}
}

export class DeleteGenre {
    static readonly type = '[Genre] DeleteGenre';

    constructor(public id?: string) {}
}

/*******************************
 *** AuthorState            ***
 ********************************/
export const STATE_NAME = 'genre';

@State<GenreStateModel>({
    name: STATE_NAME,
    defaults: new GenreStateModel()
})

@Injectable()
export class GenreState {
    constructor(
        private genreService: GenreService,
        private materialService: MaterialService
    ) { }

    /****************
     *** Selectors ***
     *****************/
    @Selector()
    static Genres(state: GenreStateModel): Genre[] {
        return state.genres;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitGenreState)
    initAuthorState(ctx: StateContext<GenreStateModel>) {
        ctx.setState(new GenreStateModel());
        return ctx;
    }

    @Action(LoadGenres)
    loadAuthors(ctx: StateContext<GenreStateModel>) {
        // return this.userService.getUser(id).pipe(tap(async response => {
        //     const { user } = response;
        //     ctx.dispatch(new SetUser(user));
        // }));
    }

    @Action(SetGenres)
    setAuthor(ctx: StateContext<GenreStateModel>, action: SetGenres) {
        return ctx.patchState({ genres: action.genres });
    }

    @Action(CreateGenre)
    createAuthor(ctx: StateContext<GenreStateModel>, action: CreateGenre) {
        // return this.userService.createUser(action.data).pipe(tap(async response => {
        //     const { message } = response;
        //     this.materialService.openSnackbar(message, SnackBarClasses.Success);
        // }));
    }

    @Action(EditGenre)
    editAuthor(ctx: StateContext<GenreStateModel>, action: EditGenre) {
        // const { data, userId } = action;
        // const { id: currentUserId } = ctx.getState().user;
        // const id = userId || currentUserId;
        // return this.userService.editUser({ id, body: data }).pipe(tap(async response => {
        //     const { message } = response;
        //
        //     if (!userId && currentUserId) {
        //         ctx.dispatch(new LoadUser());
        //     }
        //
        //     this.materialService.openSnackbar(message, SnackBarClasses.Success);
        // }));
    }

    @Action(DeleteGenre)
    deleteAuthor(ctx: StateContext<StudentStateModel>, action: DeleteGenre) {
        // const { id } = action;
        // return this.userService.deleteUser(id).pipe(tap((response: any) => {
        //     const { success, message } = response;
        //     this.materialService.openSnackbar(message, SnackBarClasses.Success);
        // }));
    }
}
