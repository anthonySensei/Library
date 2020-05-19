import { Book } from './book.model';

import { Loan } from './loan.model';

export class Statistic extends Loan {
    id: number;
    books: Book[];

    constructor() {
        super();
    }
}
