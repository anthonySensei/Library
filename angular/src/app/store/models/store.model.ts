import { UserStateModel } from './user.model';
import { StudentStateModel } from './student.model';
import { LibrarianStateModel } from './librarian.model';
import { AuthorStateModel } from './author.model';
import { GenreStateModel } from './genre.model';
import { BookStateModel } from './book.model';

export class StoreStateModel {
    author: AuthorStateModel;
    book: BookStateModel;
    student: StudentStateModel;
    librarian: LibrarianStateModel;
    genre: GenreStateModel;
    user: UserStateModel;
}
