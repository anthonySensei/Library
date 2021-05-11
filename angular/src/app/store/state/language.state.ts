import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MaterialService } from '../../services/material.service';
import { Injectable } from '@angular/core';
import { SnackBarClasses } from '../../constants/snackBarClasses';
import { StudentStateModel } from '../models/student.model';
import { LanguageStateModel } from '../models/language.model';
import { LanguageService } from '../../services/language.service';
import { Language } from '../../models/language.model';


/*********************************
 *** AuthorActions - Commands ***
 **********************************/
export class InitLanguageState {
    static readonly type = '[Language] InitLanguageState';
}

export class LoadLanguages {
    static readonly type = '[Language] LoadLanguages';

    constructor() {}
}

export class SetLanguages {
    static readonly type = '[Language] SetLanguages';

    constructor(public languages: Language[]) {}
}

export class CreateLanguage {
    static readonly type = '[Language] CreateLanguage';

    constructor(public data: Language) {}
}

export class EditLanguage {
    static readonly type = '[Language] EditLanguage';

    constructor(public authorId: string, public data: Language) {}
}

export class DeleteLanguage {
    static readonly type = '[Language] DeleteLanguage';

    constructor(public id: string) {}
}

/*******************************
 *** AuthorState            ***
 ********************************/
export const STATE_NAME = 'language';

@State<LanguageStateModel>({
    name: STATE_NAME,
    defaults: new LanguageStateModel()
})

@Injectable()
export class LanguageState {
    constructor(
        private languageService: LanguageService,
        private materialService: MaterialService
    ) { }

    /****************
     *** Selectors ***
     *****************/
    @Selector()
    static Languages(state: LanguageStateModel): Language[] {
        return state.languages;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitLanguageState)
    initAuthorState(ctx: StateContext<LanguageStateModel>) {
        ctx.setState(new LanguageStateModel());
        return ctx;
    }

    @Action(LoadLanguages)
    loadLanguages(ctx: StateContext<LanguageStateModel>) {
        return this.languageService.getLanguages().pipe(tap(response => {
            ctx.dispatch(new SetLanguages(response.languages));
        }));
    }

    @Action(SetLanguages)
    setLanguages(ctx: StateContext<LanguageStateModel>, action: SetLanguages) {
        return ctx.patchState({ languages: action.languages });
    }

    @Action(CreateLanguage)
    createLanguage(ctx: StateContext<LanguageStateModel>, action: CreateLanguage) {
        return this.languageService.createLanguage(action.data).pipe(tap(response => {
            const { message } = response;
            this.materialService.openSnackbar(message, SnackBarClasses.Success);
            ctx.dispatch(new LoadLanguages());
        }));
    }

    @Action(EditLanguage)
    editLanguage(ctx: StateContext<LanguageStateModel>, action: EditLanguage) {
        const { authorId, data } = action;
        return this.languageService.editLanguage(authorId, data).pipe(tap(response => {
            const { message } = response;
            this.materialService.openSnackbar(message, SnackBarClasses.Success);
            ctx.dispatch(new LoadLanguages());
        }));
    }

    @Action(DeleteLanguage)
    deleteAuthor(ctx: StateContext<StudentStateModel>, action: DeleteLanguage) {
        const { id } = action;
        return this.languageService.deleteLanguage(id).pipe(tap((response: any) => {
            const { message } = response;
            this.materialService.openSnackbar(message, SnackBarClasses.Success);
            ctx.dispatch(new LoadLanguages());
        }));
    }
}
