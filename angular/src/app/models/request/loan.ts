import { Pagination } from '../pagination.model';

export interface GetLoans extends Pagination {
    userId?: string;
    librarianId?: string;
    filterValue?: string;
    showOnlyDebtors?: boolean;
    showOnlyReturned?: boolean;
    loanedAt?: Date;
}

export interface SummaryStatistic {
    totalBooks: number;
    loansForLastMonth: number;
    totalDebtors: number;
}

export interface Statistic {
    name: string;
    value: number;
}
