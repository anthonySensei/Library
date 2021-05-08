import { Department } from './department.model';
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
    department?: Department;
    authors: Author[];
    genres: Genre[];
}
