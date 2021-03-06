import { UserStateModel } from './user.model';
import { StudentStateModel } from './student.model';
import { LibrarianStateModel } from './librarian.model';
import { AuthorStateModel } from './author.model';
import { GenreStateModel } from './genre.model';
import { BookStateModel } from './book.model';
import { LocalizationStateModel } from './localization.model';
import { ScheduleStateModel } from './schedule.model';

export class StoreStateModel {
    author: AuthorStateModel;
    book: BookStateModel;
    student: StudentStateModel;
    genre: GenreStateModel;
    librarian: LibrarianStateModel;
    user: UserStateModel;
    localization: LocalizationStateModel;
    schedule: ScheduleStateModel;
}
