import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MaterialService } from '../../services/material.service';
import { Injectable } from '@angular/core';
import { SnackBarClasses } from '../../constants/snackBarClasses';
import { Book } from '../../models/book.model';
import { BookStateModel } from '../models/book.model';
import { BookService } from '../../services/book.service';
import { GetBooks } from '../../models/request/book';
import { Pagination } from '../../models/pagination.model';


/*********************************
 *** AuthorActions - Commands ***
 **********************************/
export class InitBookState {
    static readonly type = '[Book] InitBookState';
}

export class LoadBooks {
    static readonly type = '[Book] LoadBooks';

    constructor(public filters: GetBooks) {}
}

export class SetBook {
    static readonly type = '[Book] SetBook';

    constructor(public book: Book) {}
}

export class SetBooks {
    static readonly type = '[Book] SetBooks';

    constructor(public books: Book[], public pagination?: Pagination) {}
}

export class CreateBook {
    static readonly type = '[Book] CreateBook';

    constructor(public data: Book) {}
}

export class EditBook {
    static readonly type = '[Book] EditBook';

    constructor(public id: string, public data: Book) {}
}

export class DeleteBook {
    static readonly type = '[Book] DeleteBook';

    constructor(public id: string) {}
}

/*******************************
 *** AuthorState            ***
 ********************************/
export const STATE_NAME = 'book';

@State<BookStateModel>({
    name: STATE_NAME,
    defaults: new BookStateModel()
})

@Injectable()
export class BookState {
    constructor(
        private bookService: BookService,
        private materialService: MaterialService
    ) { }

    /****************
     *** Selectors ***
     *****************/
    @Selector()
    static Book(state: BookStateModel): Book {
        return state.book;
    }

    @Selector()
    static Books(state: BookStateModel): Book[] {
        return state.books;
    }

    @Selector()
    static Pagination(state: BookStateModel): Pagination {
        return state.pagination;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitBookState)
    initAuthorState(ctx: StateContext<BookStateModel>) {
        ctx.setState(new BookStateModel());
        return ctx;
    }

    @Action(LoadBooks)
    loadBooks(ctx: StateContext<BookStateModel>, action: LoadBooks) {
        return this.bookService.getBooks(action.filters).pipe(tap(response => {
            ctx.dispatch(new SetBooks(response.books, response.pagination));
        }));
    }

    @Action(SetBook)
    setBook(ctx: StateContext<BookStateModel>, action: SetBook) {
        return ctx.patchState({ book: action.book });
    }

    @Action(SetBooks)
    setABooks(ctx: StateContext<BookStateModel>, action: SetBooks) {
        return ctx.patchState({ books: action.books, pagination: action.pagination });
    }

    @Action(CreateBook)
    CreateBook(ctx: StateContext<BookStateModel>, action: CreateBook) {
        return this.bookService.addBook(action.data).pipe(tap(response => {
            const { message } = response;
            this.materialService.openSnackbar(message, SnackBarClasses.Success);
            ctx.dispatch(new LoadBooks({ page: 0, pageSize: 16 }));
        }));
    }
    //
    // @Action(EditBook)
    // EditBook(ctx: StateContext<BookStateModel>, action: EditBook) {
    //     const { authorId, data } = action;
    //     return this.authorService.EditBook(authorId, data).pipe(tap(response => {
    //         const { message } = response;
    //         this.materialService.openSnackbar(message, SnackBarClasses.Success);
    //         ctx.dispatch(new LoadBooks());
    //     }));
    // }
    //
    // @Action(DeleteBook)
    // deleteAuthor(ctx: StateContext<StudentStateModel>, action: DeleteBook) {
    //     const { id } = action;
    //     return this.authorService.deleteAuthor(id).pipe(tap((response: any) => {
    //         const { message } = response;
    //         this.materialService.openSnackbar(message, SnackBarClasses.Success);
    //         ctx.dispatch(new LoadBooks());
    //     }));
    // }
}
