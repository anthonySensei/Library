import { User } from '../../models/user.model';

export class StudentStateModel {
    studentsTotalItems: number;
    students: User[] = [];
    student: User = null;
}
