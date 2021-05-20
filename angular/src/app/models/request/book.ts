export interface GetBooksModel {
    page: number;
    pageSize: number;
    authors?: string[];
    genres?: string[];
    yearFrom?: string;
    yearTo?: string;
    filterValue?: string;
}

export interface LoanBookModel {
    userCredentials: string;
    librarianId: string;
    bookId: string;
}
