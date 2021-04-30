import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { LoadStudents } from '../store/student.state';
import { StoreStateModel } from '../store/store.model';
import { User } from '../models/user.model';

export class StudentsDataSource implements DataSource<User> {
    private studentSubject = new BehaviorSubject<User[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private store: Store) {}

    loadStudents(filterValue: string, sortName: string, sortOrder: string, pageIndex: number, pageSize: number) {
        this.loadingSubject.next(true);
        this.store
            .dispatch(new LoadStudents(filterValue, sortName, sortOrder, pageIndex, pageSize))
            .pipe(catchError(() => of([])), finalize(() => this.loadingSubject.next(false)))
            .subscribe((state: StoreStateModel) => this.studentSubject.next(state?.student?.students));
    }

    connect(collectionViewer: CollectionViewer): Observable<User[]> {
        return this.studentSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.studentSubject.complete();
        this.loadingSubject.complete();
    }
}
