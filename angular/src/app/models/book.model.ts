import { Author } from './author.model';
import { Genre } from './genre.model';

export interface Book {
    id?: number;
    isbn: number;
    title: string;
    language: string;
    image: string;
    description: string;
    year: number;
    quantity: number;
    authors: Author[];
    genres: Genre[];
}
