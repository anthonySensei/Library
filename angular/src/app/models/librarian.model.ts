import { Role } from './role.model';
import { Department } from './department.model';
import { User } from './user.model';

export class Librarian extends User {
    id: string;
    department: Department;
    loans?;
    schedule?;
    statistic?;

    constructor(
        id: string,
        name: string,
        email: string,
        image: string,
        password: string,
        role: Role,
        department: Department
    ) {
        super(name, email, image, password);
        this.id = id;
        this.department = department;
    }
}
