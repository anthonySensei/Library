import { User } from './user.model';
import { Role } from './role.model';

import { UserRoles } from '../constants/userRoles';

export class Student extends User {
    id: string;
    status?: string;
    loans?;
    statistic?;
    orders?;

    constructor(
        id: string,
        name: string,
        email: string,
        image: string,
        password: string,
        status?: string
    ) {
        super(name, email, image, password);
        this.id = id;
        this.status = status;
    }
}
