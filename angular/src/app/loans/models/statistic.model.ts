import { Book } from '../../main-page/models/book.model';

import { Loan } from './loan.model';

export class Statistic extends Loan {
    id: number;
    books: Book[];

    constructor() {
        super();
    }
}
