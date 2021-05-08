export interface GetBooks {
    page: number;
    author?: number;
    genre?: number;
    department?: number;
    yearFrom?: number;
    yearTo?: number;
    filterName?: string;
    filterValue?: string;
}
