export class Pagination {
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number;
    previousPage: number;
    lastPage: number;

    constructor(
        currentPage: number,
        hasNextPage: boolean,
        hasPreviousPage: boolean,
        nextPage: number,
        previousPage: number,
        lastPage: number
    ) {
        this.currentPage = currentPage;
        this.hasNextPage = hasNextPage;
        this.hasPreviousPage = hasPreviousPage;
        this.nextPage = nextPage;
        this.previousPage = previousPage;
        this.lastPage = lastPage;
    }
}
