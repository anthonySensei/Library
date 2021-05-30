import { User } from '../../models/user.model';

export class LibrarianStateModel {
    librariansTotalItems: number;
    librarians: User[] = [];
    librarian: User = null;
}
