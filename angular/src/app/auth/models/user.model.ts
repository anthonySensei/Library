import { Role } from '../../user/models/role.model';

export class User {
    name: string;
    email: string;
    profileImage: string;
    password: string;
    role: Role;

    constructor(
        name: string,
        email: string,
        image: string,
        password: string,
        role: Role
    ) {
        this.name = name;
        this.email = email;
        this.profileImage = image;
        this.password = password;
        this.role = role;
    }
}
