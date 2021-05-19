import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Loan } from '../models/loan.model';
import { GetLoans } from '../models/request/loan';
import { Store } from '@ngxs/store';
import { LoadLoans } from '../store/state/book.state';
import { StoreStateModel } from '../store/models/store.model';

export class LoansDataSource implements DataSource<Loan> {
    private loansSubject = new BehaviorSubject<Loan[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private store: Store) {}

    loadLoans(params: GetLoans) {
        this.loadingSubject.next(true);
        this.store
            .dispatch(new LoadLoans(params))
            .pipe(catchError(() => of([])), finalize(() => this.loadingSubject.next(false)))
            .subscribe((state: StoreStateModel) => this.loansSubject.next(state.book.loans));
    }

    connect(collectionViewer: CollectionViewer): Observable<Loan[]> {
        return this.loansSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.loansSubject.complete();
        this.loadingSubject.complete();
    }
}
