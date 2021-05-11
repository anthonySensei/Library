import { Document } from 'mongoose';

export interface AuthorSchema extends Document {
    name: string;
    country: string;
}

export interface AuthorModel {
    name: string;
    country: string;
}
