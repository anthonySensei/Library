export class Schedule {
    id: number;
    day: string;
    librarian: any;

    constructor(id: number, day: string, librarian: any) {
        this.id = id;
        this.day = day;
        this.librarian = librarian;
    }
}
