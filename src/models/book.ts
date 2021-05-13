import { Document } from 'mongoose';

export interface BookSchema extends Document {
    isbn: string;
    title: string;
    year: number;
    quantity: number;
    description: number;
    image: string;
    language: string;
    authors: any[];
    genres: any[];
}
