import { Author } from './author.model';
import { Genre } from './genre.model';

export interface Book {
    id?: string;
    isbn: string;
    title: string;
    language: string;
    image: string;
    description: string;
    year: number;
    quantity: number;
    authors: Author[];
    genres: Genre[];
}
