export interface GetBooksModel {
    page: number;
    pageSize: number;
    authors?: string[];
    genres?: string[];
    department?: string;
    yearFrom?: string;
    yearTo?: string;
    filterValue?: string;
}

export interface LoanBookModel {
    userCredentials: string;
    librarianId: string;
    bookId: string;
}
