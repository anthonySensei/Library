import { Department } from './department.model';
import { Author } from './author.model';

export class Book {
    bookId: number;
    isbn: number;
    name: string;
    author: Author;
    genre: string;
    image: string;
    status: string;
    description: string;
    year: number;
    department: Department;

    constructor(
        id: number,
        isbn: number,
        name: string,
        author: Author,
        genre: string,
        image: string,
        status: string,
        description: string,
        year: number,
        department: Department
    ) {
        this.bookId = id;
        this.isbn = isbn;
        this.name = name;
        this.author = author;
        this.image = image;
        this.genre = genre;
        this.status = status;
        this.description = description;
        this.year = year;
        this.department = department;
    }
}
