import { Role } from './role.model';
import { Department } from '../../main-page/models/department.model';

export class Librarian {
    id: number;
    name: string;
    email: string;
    profileImage: string;
    password: string;
    role: Role;
    department: Department;
    loans?;
    schedule?;

    constructor(
        id: number,
        name: string,
        email: string,
        image: string,
        password: string,
        role: Role,
        department: Department
) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profileImage = image;
        this.password = password;
        this.role = role;
        this.department = department;
    }
}
