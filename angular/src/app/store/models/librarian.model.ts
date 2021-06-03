import { User } from '../../models/user.model';

export class LibrarianStateModel {
    librariansTotalItems = 0;
    librarians: User[] = [];
    librarian: User = null;
}
