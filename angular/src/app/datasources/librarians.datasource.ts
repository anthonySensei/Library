import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Librarian } from '../models/librarian.model';
import { LibrarianService } from '../services/librarian.service';

export class LibrariansDataSource implements DataSource<Librarian> {
    private librariansSubject = new BehaviorSubject<Librarian[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private librarianService: LibrarianService) {}

    loadLibrarians(
        filterName: string,
        filterValue: string,
        departmentId: number,
        sortOrder: string,
        pageIndex: number,
        pageSize: number
    ) {
        this.loadingSubject.next(true);

        this.librarianService
            .getLibrariansHttp(
                filterName,
                filterValue,
                departmentId,
                sortOrder,
                pageIndex,
                pageSize
            )
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((librarians: Librarian[]) => this.librariansSubject.next(librarians));
    }

    connect(collectionViewer: CollectionViewer): Observable<Librarian[]> {
        return this.librariansSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.librariansSubject.complete();
        this.loadingSubject.complete();
    }
}
