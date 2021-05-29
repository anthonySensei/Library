export interface Pagination {
    page: number;
    pageSize: number;
    sortName: string;
    sortOrder: string;
    length?: number;
    librarianId?: string;
}

