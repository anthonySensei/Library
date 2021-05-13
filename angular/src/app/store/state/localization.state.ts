import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { LocalizationStateModel } from '../models/localization.model';
import { Country } from '../../models/country.model';
import { Language } from '../../models/language.model';

import * as isoCountries from 'i18n-iso-countries';
import * as isoLanguages from '@cospired/i18n-iso-languages';


/*********************************
 *** AuthorActions - Commands ***
 **********************************/
export class InitLocalizationState {
    static readonly type = '[Localization] InitLocalizationState';
}

/*******************************
 *** AuthorState            ***
 ********************************/
export const STATE_NAME = 'localization';

@State<LocalizationStateModel>({
    name: STATE_NAME,
    defaults: new LocalizationStateModel()
})

@Injectable()
export class LocalizationState {
    constructor() { }

    /****************
     *** Selectors ***
     *****************/
    @Selector()
    static Countries(state: LocalizationStateModel): Country[] {
        return state.countries;
    }

    @Selector()
    static Languages(state: LocalizationStateModel): Language[] {
        return state.languages;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitLocalizationState)
    initAuthorState(ctx: StateContext<LocalizationStateModel>) {
        ctx.setState(new LocalizationStateModel());
        isoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));
        isoCountries.registerLocale(require('i18n-iso-countries/langs/uk.json'));
        isoLanguages.registerLocale(require('@cospired/i18n-iso-languages/langs/en.json'));
        const countries = Object
            .entries(isoCountries.getNames('en', {select: 'official'}))
            .map(country => ({ code: country[0], name: country[1] }));
        const languages = Object
            .entries(isoLanguages.getNames('en'))
            .map(language => ({ code: language[0], name: language[1] as string }));
        return ctx.patchState({ countries, languages });
    }
}
