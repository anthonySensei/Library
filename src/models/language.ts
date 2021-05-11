import { Document } from 'mongoose';

export interface LanguageSchema extends Document {
    englishTitle: string;
    code: string;
}

export interface LanguageModel {
    englishTitle: string;
    code: string;
}
