import { Role } from './role.model';

export class Librarian {
    id: number;
    name: string;
    email: string;
    profileImage: string;
    password: string;
    role: Role;

    constructor(
        id: number,
        name: string,
        email: string,
        image: string,
        password: string,
        role: Role
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profileImage = image;
        this.password = password;
        this.role = role;
    }
}
