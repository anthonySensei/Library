import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { StoreStateModel } from '../store/models/store.model';
import { LoadLibrarians } from '../store/state/librarian.state';
import { User } from '../models/user.model';

export class LibrariansDataSource implements DataSource<User> {
    private librariansSubject = new BehaviorSubject<User[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private store: Store) {}

    loadLibrarians(filterValue: string, sortName: string, sortOrder: string, pageIndex: number, pageSize: number) {
        this.loadingSubject.next(true);
        this.store
            .dispatch(new LoadLibrarians(filterValue, sortName, sortOrder, pageIndex, pageSize))
            .pipe(catchError(() => of([])), finalize(() => this.loadingSubject.next(false)))
            .subscribe((state: StoreStateModel) => this.librariansSubject.next(state?.librarian?.librarians));
    }

    connect(collectionViewer: CollectionViewer): Observable<User[]> {
        return this.librariansSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.librariansSubject.complete();
        this.loadingSubject.complete();
    }
}
