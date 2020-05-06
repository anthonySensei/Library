import { Role } from '../../user/models/role.model';

export class User {
    name: string;
    email: string;
    profileImage: string;
    role?: Role;
    readerTicket?: string;

    constructor(
        name: string,
        email: string,
        image: string,
        role?: Role,
        ticket?: string
    ) {
        this.name = name;
        this.email = email;
        this.profileImage = image;
        this.role = role;
        this.readerTicket = ticket;
    }
}
