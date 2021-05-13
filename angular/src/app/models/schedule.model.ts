import { Period } from './period.model';

export class Schedule {
    id: number;
    day: string;
    librarian: any;
    period: Period;

    constructor(id: number, day: string, librarian: any, period: Period) {
        this.id = id;
        this.day = day;
        this.librarian = librarian;
        this.period = period;
    }
}
