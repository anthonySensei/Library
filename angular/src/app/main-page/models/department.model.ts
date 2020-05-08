export class Department {
    id: number;
    bookId: number;
    address: string;
    postCreatedAt: Date;
    postUpdatedAt: Date;

    constructor(
        id: number,
        address: string,
        createdAt: Date,
        updatedAt: Date,
    ) {
        this.bookId = id;
        this.address = name;
        this.postCreatedAt = createdAt;
        this.postUpdatedAt = updatedAt;
    }
}
