import { Country } from '../../models/country.model';
import { Language } from '../../models/language.model';

export class LocalizationStateModel {
    countries: Country[] = [];
    languages: Language[] = [];
}
