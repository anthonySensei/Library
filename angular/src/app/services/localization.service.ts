import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { LocalizationState } from '../store/state/localization.state';
import { Language } from '../models/language.model';

@Injectable({ providedIn: 'root' })
export class LocalizationService {

    constructor(private store: Store) {}

    public getCountryName(countryCode: string): string {
        const countries = this.store.selectSnapshot(LocalizationState.Countries);
        return countries.find(country => country.code === countryCode)?.name;
    }

    public getLanguage(languageCode: string): Language {
        const languages = this.store.selectSnapshot(LocalizationState.Languages);
        return languages.find(language => language.code === languageCode);
    }

    public getLanguageName(languageCode: string): string {
        const languages = this.store.selectSnapshot(LocalizationState.Languages);
        return languages.find(language => language.code === languageCode)?.name;
    }
}
