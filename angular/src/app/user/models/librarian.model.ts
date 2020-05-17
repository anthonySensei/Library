import { Role } from './role.model';
import { Department } from '../../main-page/models/department.model';
import { User } from '../../auth/models/user.model';

export class Librarian extends User {
    id: number;
    department: Department;
    loans?;
    schedule?;
    statistic?;

    constructor(
        id: number,
        name: string,
        email: string,
        image: string,
        password: string,
        role: Role,
        department: Department
    ) {
        super(name, email, image, password, role);
        this.id = id;
        this.department = department;
    }
}
