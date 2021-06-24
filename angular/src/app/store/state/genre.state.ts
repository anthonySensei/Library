import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MaterialService } from '../../services/material.service';
import { Injectable } from '@angular/core';
import { StudentStateModel } from '../models/student.model';
import { GenreStateModel } from '../models/genre.model';
import { GenreService } from '../../services/genre.service';
import { Genre } from '../../models/genre.model';
import { tap } from 'rxjs/operators';
import { SnackBarClasses } from '../../constants/snackBarClasses';


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

    constructor(public name: string) {}
}

export class EditGenre {
    static readonly type = '[Genre] EditGenre';

    constructor(public id: string, public name: string) {}
}

export class DeleteGenre {
    static readonly type = '[Genre] DeleteGenre';

    constructor(public id: string) {}
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
        return ctx.setState(new GenreStateModel());
    }

    @Action(LoadGenres)
    loadAuthors(ctx: StateContext<GenreStateModel>) {
        return this.genreService.getGenres().pipe(tap(response => ctx.dispatch(new SetGenres(response.genres))));
    }

    @Action(SetGenres)
    setGenres(ctx: StateContext<GenreStateModel>, action: SetGenres) {
        return ctx.patchState({ genres: action.genres });
    }

    @Action(CreateGenre)
    createGenre(ctx: StateContext<GenreStateModel>, action: CreateGenre) {
        return this.genreService.createGenre({ name: action.name }).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadGenres());
        }));
    }

    @Action(EditGenre)
    editAuthor(ctx: StateContext<GenreStateModel>, action: EditGenre) {
        const { id, name } = action;
        return this.genreService.ediGenre(id, { name }).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadGenres());
        }));
    }

    @Action(DeleteGenre)
    deleteGenre(ctx: StateContext<StudentStateModel>, action: DeleteGenre) {
        const { id } = action;
        return this.genreService.deleteGenre(id).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadGenres());
        }));
    }
}
