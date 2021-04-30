import { User } from '../models/user.model';

export class LibrarianStateModel {
    librarians: User[] = [];
    librarian: User = null;
}
