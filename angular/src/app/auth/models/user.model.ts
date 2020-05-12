import { Role } from '../../user/models/role.model';

export class User {
    name: string;
    email: string;
    profileImage: string;
    role?: Role;

    constructor(
        name: string,
        email: string,
        image: string,
        role?: Role,
    ) {
        this.name = name;
        this.email = email;
        this.profileImage = image;
        this.role = role;
    }
}
