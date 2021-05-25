import { Author } from './author.model';
import { Genre } from './genre.model';

export interface Book {
    _id?: string;
    isbn: string;
    title: string;
    language: string;
    image: string;
    description: string;
    year: number;
    quantity: number;
    ebook?: boolean;
    file?: File | string;
    authors: Author[];
    genres: Genre[];
}
