import { Department } from './department.model';
import { Author } from './author.model';
import { Genre } from './genre.model';

export class Book {
    id: number;
    isbn: number;
    name: string;
    author: Author;
    genre: Genre;
    image: string;
    description: string;
    year: number;
    quantity: number;
    department: Department;

    constructor(
        id: number,
        isbn: number,
        name: string,
        author: Author,
        genre: Genre,
        image: string,
        description: string,
        year: number,
        quantity: number,
        department: Department
    ) {
        this.id = id;
        this.isbn = isbn;
        this.name = name;
        this.author = author;
        this.image = image;
        this.genre = genre;
        this.description = description;
        this.year = year;
        this.quantity = quantity;
        this.department = department;
    }
}
