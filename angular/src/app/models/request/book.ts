export interface GetBooksModel {
    page: number;
    pageSize: number;
    yearFrom?: string;
    yearTo?: string;
    language?: string;
    filterValue?: string;
    onlyEbooks?: boolean;
    onlyNormalBooks?: boolean;
    authors?: string[];
    genres?: string[];
}

export interface LoanBookModel {
    userCredentials: string;
    librarianId: string;
    bookId: string;
}
