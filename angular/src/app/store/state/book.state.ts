import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MaterialService } from '../../services/material.service';
import { Injectable } from '@angular/core';
import { SnackBarClasses } from '../../constants/snackBarClasses';
import { Book } from '../../models/book.model';
import { BookStateModel } from '../models/book.model';
import { BookService } from '../../services/book.service';
import { GetBooksModel } from '../../models/request/book';
import { Pagination } from '../../models/pagination.model';
import { Response } from '../../models/response.model';
import { Loan } from '../../models/loan.model';
import { GetLoans, SummaryStatistic } from '../../models/request/loan';
import { UserState } from './user.state';


/*********************************
 *** AuthorActions - Commands ***
 **********************************/
export class InitBookState {
    static readonly type = '[Book] InitBookState';
}

export class LoadBook {
    static readonly type = '[Book] LoadBook';

    constructor(public id: string) {}
}

export class LoadBooks {
    static readonly type = '[Book] LoadBooks';

    constructor(public filters: GetBooksModel) {}
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

export class LoanBook {
    static readonly type = '[Book] LoanBook';

    constructor(public credentials: string, public bookId?: string) {}
}

export class ReturnBook {
    static readonly type = '[Book] ReturnBook';

    constructor(public loanId: string) {}
}

export class LoadLoans {
    static readonly type = '[Book] LoadLoans';

    constructor(public filters: GetLoans) {}
}

export class SetLoans {
    static readonly type = '[Book] SetLoans';

    constructor(public loans: Loan[], public quantity?: number) {}
}

export class LoadSummaryStatistic {
    static readonly type = '[Book] LoadSummaryStatistic';
}

export class SetSummaryStatistic {
    static readonly type = '[Book] SetSummaryStatistic';

    constructor(public summaryStatistic: SummaryStatistic) {}
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
        private materialService: MaterialService,
        private store: Store
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
    static LoansTotalItems(state: BookStateModel): number {
        return state.loansTotalItems;
    }

    @Selector()
    static Loans(state: BookStateModel): Loan[] {
        return state.loans;
    }

    @Selector()
    static Pagination(state: BookStateModel): Pagination {
        return state.pagination;
    }

    @Selector()
    static SummaryStatistic(state: BookStateModel): SummaryStatistic {
        return state.summaryStatistic;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitBookState)
    initAuthorState(ctx: StateContext<BookStateModel>) {
        ctx.setState(new BookStateModel());
        return ctx;
    }

    @Action(LoadBook)
    loadBook(ctx: StateContext<BookStateModel>, action: LoadBook) {
        return this.bookService.getBook(action.id).pipe(tap(response => ctx.dispatch(new SetBook(response.book))));
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

    @Action(EditBook)
    editBook(ctx: StateContext<BookStateModel>, action: EditBook) {
        const { id, data } = action;
        return this.bookService.editBook(id, data).pipe(tap(response => {
            const { message } = response;
            this.materialService.openSnackbar(message, SnackBarClasses.Success);
            ctx.dispatch(new LoadBook(id));
        }));
    }

    @Action(DeleteBook)
    deleteBook(ctx: StateContext<BookStateModel>, action: DeleteBook) {
        const { id } = action;
        return this.bookService.deleteBook(id).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
        }));
    }

    @Action(LoanBook)
    loanBook(ctx: StateContext<BookStateModel>, action: LoanBook) {
        const { credentials, bookId  } = action;
        const id = bookId || ctx.getState().book?.id;
        const librarianId = this.store.selectSnapshot(UserState.User).id;
        return this.bookService.loanBook({ userCredentials: credentials, bookId: id, librarianId }).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadBook(id));
        }));
    }

    @Action(ReturnBook)
    returnBook(ctx: StateContext<BookStateModel>, action: ReturnBook) {
        return this.bookService.returnBook(action.loanId).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
        }));
    }

    @Action(LoadLoans)
    loadLoans(ctx: StateContext<BookStateModel>, action: LoadLoans) {
        return this.bookService.getLoans(action.filters).pipe(tap(response => {
            ctx.dispatch(new SetLoans(response.loans, response.quantity));
        }));
    }

    @Action(SetLoans)
    setLoans(ctx: StateContext<BookStateModel>, action: SetLoans) {
        return ctx.patchState({ loans: action.loans, loansTotalItems: action.quantity });
    }

    @Action(LoadSummaryStatistic)
    loadSummaryStatistic(ctx: StateContext<BookStateModel>) {
        return this.bookService
            .getSummaryStatistic()
            .pipe(tap(response => ctx.dispatch(new SetSummaryStatistic(response.summaryStatistic))));
    }

    @Action(SetSummaryStatistic)
    setSummaryStatistic(ctx: StateContext<BookStateModel>, action: SetSummaryStatistic) {
        return ctx.patchState({ summaryStatistic: action.summaryStatistic });
    }
}
