import { Document } from 'mongoose';

export interface GenreSchema extends Document {
    name: {
        en: string;
        uk: string;
    };
}


