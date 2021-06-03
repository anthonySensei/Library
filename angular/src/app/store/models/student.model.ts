import { User } from '../../models/user.model';

export class StudentStateModel {
    studentsTotalItems = 0;
    students: User[] = [];
    student: User = null;
}
