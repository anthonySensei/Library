import { Document } from 'mongoose';

export interface BookSchema extends Document {
    isbn: string;
    title: string;
    year: number;
    quantity: number;
    description: number;
    image: string;
    language: string;
    ebook: boolean;
    file: string;
    authors: any[];
    genres: any[];
}

export interface BookModel {
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
