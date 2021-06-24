import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MaterialService } from '../../services/material.service';
import { Injectable } from '@angular/core';
import { SnackBarClasses } from '../../constants/snackBarClasses';
import { Book, BookStats } from '../../models/book.model';
import { BookStateModel } from '../models/book.model';
import { BookService } from '../../services/book.service';
import { GetBooksModel } from '../../models/request/book';
import { Pagination } from '../../models/pagination.model';
import { Loan } from '../../models/loan.model';
import { GetLoans, Statistic, SummaryStatistic } from '../../models/request/loan';
import { UserState } from './user.state';
import { models } from '../../constants/models';
import { GetOrdersModel, LoanBookFromOrderModel, Order } from '../../models/order.model';


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

export class LoadBookStats {
    static readonly type = '[Book] LoadBookStats';

    constructor(public id: string) {}
}

export class LoadBooks {
    static readonly type = '[Book] LoadBooks';

    constructor(public filters: GetBooksModel) {}
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

export class LoadOrders {
    static readonly type = '[Book] LoadOrders';

    constructor(public filters: GetOrdersModel) {}
}

export class OrderBook {
    static readonly type = '[Book] OrderBook';

    constructor(public bookId?: string) {}
}

export class LoanBookFromOrder {
    static readonly type = '[Book] LoanBookFromOrder';

    constructor(public data: LoanBookFromOrderModel) {}
}

export class LoadStatistic {
    static readonly type = '[Book] LoadStatistic';

    constructor(public model: string, public value: string) {}
}

export class LoadSummaryStatistic {
    static readonly type = '[Book] LoadSummaryStatistic';
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
    static BookStats(state: BookStateModel): BookStats {
        return state.bookStats;
    }

    @Selector()
    static Loans(state: BookStateModel): Loan[] {
        return state.loans;
    }

    @Selector()
    static LoansTotalItems(state: BookStateModel): number {
        return state.loansTotalItems;
    }

    @Selector()
    static Orders(state: BookStateModel): Order[] {
        return state.orders;
    }

    @Selector()
    static OrdersTotalItems(state: BookStateModel): number {
        return state.ordersTotalItems;
    }

    @Selector()
    static Pagination(state: BookStateModel): Pagination {
        return state.pagination;
    }

    @Selector()
    static Statistic(state: BookStateModel): Statistic[] {
        return state.statistic;
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
        return this.bookService.getBook(action.id).pipe(tap(response => ctx.patchState({ book: response.book })));
    }

    @Action(LoadBooks)
    loadBooks(ctx: StateContext<BookStateModel>, action: LoadBooks) {
        return this.bookService.getBooks(action.filters).pipe(tap(response => {
            ctx.patchState({ books: response.books, pagination: response.pagination });
        }));
    }

    @Action(LoadBookStats)
    loadBookStats(ctx: StateContext<BookStateModel>, action: LoadBookStats) {
        return this.bookService.getBookStats(action.id).pipe(tap(response => ctx.patchState({ bookStats: response.bookStats })));
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
        const id = bookId || ctx.getState().book?._id;
        const librarianId = this.store.selectSnapshot(UserState.User)._id;
        return this.bookService.loanBook({ userCredentials: credentials, bookId: id, librarianId }).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch([new LoadBook(id), new LoadBookStats(id)]);
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
            ctx.patchState({ loans: response.loans, loansTotalItems: response.quantity });
        }));
    }

    @Action(LoadStatistic)
    loadStatistic(ctx: StateContext<BookStateModel>, action: LoadStatistic) {
        switch (action.model) {
            case models.USER:
                return this.bookService
                    .getUserStatistic(action.value)
                    .pipe(tap(response => ctx.patchState({ statistic: response.statistic })));
            case models.LIBRARIAN:
                return this.bookService
                    .getLibrarianStatistic(action.value)
                    .pipe(tap(response => ctx.patchState({ statistic: response.statistic })));
            case models.BOOK:
                return this.bookService
                    .getBookStatistic(action.value)
                    .pipe(tap(response => ctx.patchState({ statistic: response.statistic })));
        }
    }

    @Action(LoadSummaryStatistic)
    loadSummaryStatistic(ctx: StateContext<BookStateModel>) {
        return this.bookService
            .getSummaryStatistic()
            .pipe(tap(response => ctx.patchState({ summaryStatistic: response.summaryStatistic })));
    }

    @Action(LoadOrders)
    loadOrders(ctx: StateContext<BookStateModel>, action: LoadOrders) {
        return this.bookService.getOrders(action.filters).pipe(tap(response => {
            ctx.patchState({ orders: response.orders, ordersTotalItems: response.quantity });
        }));
    }

    @Action(OrderBook)
    orderBook(ctx: StateContext<BookStateModel>, action: OrderBook) {
        const { bookId  } = action;
        const id = bookId || ctx.getState().book?._id;
        const userId = this.store.selectSnapshot(UserState.User)._id;
        return this.bookService.orderBook({ bookId: id, userId }).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadBook(id));
        }));
    }

    @Action(LoanBookFromOrder)
    loanBookFromOrder(ctx: StateContext<BookStateModel>, action: LoanBookFromOrder) {
        const { orderId, bookId, userId  } = action.data;
        const librarianId = this.store.selectSnapshot(UserState.User)._id;
        return this.bookService.loanBookFromOrder({ orderId, bookId, userId, librarianId }).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
        }));
    }
}
