import { UserStateModel } from './user.model';
import { StudentStateModel } from './student.model';
import { LibrarianStateModel } from './librarian.model';
import { AuthorStateModel } from './author.model';
import { GenreStateModel } from './genre.model';

export class StoreStateModel {
    user: UserStateModel;
    student: StudentStateModel;
    librarian: LibrarianStateModel;
    author: AuthorStateModel;
    genre: GenreStateModel;
}
