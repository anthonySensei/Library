import { User } from './user.model';

export interface Schedule {
    _id: string;
    start: Date | string;
    end: Date | string;
    weekDays: string[];
    librarian: User | string;
}
