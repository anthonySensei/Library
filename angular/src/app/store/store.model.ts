import { UserStateModel } from './user.model';
import { StudentStateModel } from './student.model';
import { LibrarianStateModel } from './librarian.model';

export class StoreStateModel {
    user: UserStateModel;
    student: StudentStateModel;
    librarian: LibrarianStateModel;
}
