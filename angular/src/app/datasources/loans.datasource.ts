import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Loan } from '../models/loan.model';

import { LoansService } from '../services/loans.service';

export class LoansDataSource implements DataSource<Loan> {
    private loansSubject = new BehaviorSubject<Loan[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private loansService: LoansService) {}

    loadLoans(
        filterName: string,
        filterValue: string,
        sortOrder: string,
        pageIndex: number,
        pageSize: number,
        departmentId: number,
        loanDate: Date,
        isShowDebtors: boolean,
        librarianId: number = null,
        studentId: number = null
    ) {
        this.loadingSubject.next(true);

        this.loansService
            .fetchLoansHttp(
                filterName,
                filterValue,
                sortOrder,
                pageIndex,
                pageSize,
                departmentId,
                loanDate,
                isShowDebtors,
                librarianId,
                studentId
            )
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((loans: Loan[]) => this.loansSubject.next(loans));
    }

    connect(collectionViewer: CollectionViewer): Observable<Loan[]> {
        return this.loansSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.loansSubject.complete();
        this.loadingSubject.complete();
    }
}
