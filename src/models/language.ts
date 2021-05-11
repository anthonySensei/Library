import { Document } from 'mongoose';

export interface LanguageSchema extends Document {
    englishTitle: string;
    code: string;
    englishCountry: string;
}
