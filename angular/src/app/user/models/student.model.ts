export class Student {
    id: number;
    name: string;
    email: string;
    profileImage: string;
    readerTicket: string;
    password: string;
    status?: string;

    constructor(
        id: number,
        name: string,
        email: string,
        image: string,
        ticket: string,
        password: string,
        status?: string
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profileImage = image;
        this.readerTicket = ticket;
        this.password = password;
        this.status = status;
    }
}
