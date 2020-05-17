import { User } from '../../auth/models/user.model';
import { UserRoles } from '../../constants/userRoles';
import { Role } from './role.model';

export class Student extends User {
    id: number;
    readerTicket: string;
    status?: string;
    loans?;
    statistic?;
    orders?;

    constructor(
        id: number,
        name: string,
        email: string,
        image: string,
        ticket: string,
        password: string,
        status?: string
    ) {
        super(name, email, image, password, new Role(null, UserRoles.STUDENT));
        this.id = id;
        this.readerTicket = ticket;
        this.status = status;
    }
}
