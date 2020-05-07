import { Librarian } from './librarian.model';

export class Schedule {
    id: number;
    day: string;
    start: string;
    end: string;
    librarian: Librarian;

    constructor(
        id: number,
        day: string,
        start: string,
        end: string,
        librarian: Librarian
    ) {
        this.id = id;
        this.day = day;
        this.start = start;
        this.end = end;
        this.librarian = librarian;
    }
}
