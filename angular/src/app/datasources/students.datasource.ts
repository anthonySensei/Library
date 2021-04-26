import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Student } from '../models/student.model';
import { Store } from '@ngxs/store';
import { LoadStudents } from '../store/student.state';
import { StoreStateModel } from '../store/store.model';

export class StudentsDataSource implements DataSource<Student> {
    private studentSubject = new BehaviorSubject<Student[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private store: Store) {}

    loadStudents(
        filterName: string,
        filterValue: string,
        sortOrder: string,
        pageIndex: number,
        pageSize: number
    ) {
        this.loadingSubject.next(true);

        this.store
            .dispatch(new LoadStudents(
                filterName,
                filterValue,
                sortOrder,
                pageIndex,
                pageSize
             ))
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((state: StoreStateModel) => this.studentSubject.next(state?.student?.students));
    }

    connect(collectionViewer: CollectionViewer): Observable<Student[]> {
        return this.studentSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.studentSubject.complete();
        this.loadingSubject.complete();
    }
}
