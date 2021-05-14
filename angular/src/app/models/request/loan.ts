export interface GetLoans {
    page: number;
    pageSize: number;
    userId?: string;
    librarianId?: string;
    filterValue?: string;
    sortName?: string;
    sortOrder?: string;
    showOnlyDebtors?: boolean;
    showOnlyReturned?: boolean;
    loanedAt?: Date;
}
