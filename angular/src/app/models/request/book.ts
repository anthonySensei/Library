export interface GetBooks {
    page: number;
    pageSize: number;
    authors?: string[];
    genres?: string[];
    department?: string;
    yearFrom?: string;
    yearTo?: string;
    filterValue?: string;
}
