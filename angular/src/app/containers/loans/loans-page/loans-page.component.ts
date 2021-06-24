import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Loan } from '../../../models/loan.model';

import { LoansDataSource } from '../../../datasources/loans.datasource';

import { TableColumns } from '../../../constants/tableColumns';
import { PageTitles } from '../../../constants/pageTitles';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TABLE_ANIMATION } from '../../../constants/animation';
import { Store } from '@ngxs/store';
import { SortOrder } from '../../../constants/sortOrder';
import { BookState, ReturnBook } from '../../../store/state/book.state';

@Component({
    selector: 'app-loan-page',
    templateUrl: './loans-page.component.html',
    animations: TABLE_ANIMATION
})
export class LoansPageComponent implements OnInit, AfterViewInit, OnDestroy {

    filterValue: string;
    showOnlyDebtors: boolean;
    showOnlyReturned: boolean;
    columnsToDisplay: string[] = ['user', 'librarian', 'book', 'loanedAt', 'returnedAt'];
    expandedElement: Loan | null;
    loanedAt: Date;

    dataSource: LoansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(public store: Store) {}

    ngOnInit(): void {
        document.title = PageTitles.LOANS;
        this.dataSource = new LoansDataSource(this.store);
        this.onLoadLoans();
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.pipe(untilDestroyed(this)).subscribe(() => (this.paginator.pageIndex = 0));
        merge(
            this.sort.sortChange,
            this.paginator.page
        ).pipe(untilDestroyed(this)).pipe(tap(() => this.onLoadLoans())).subscribe();
    }

    getTotalItems(): number {
        return this.store.selectSnapshot(BookState.LoansTotalItems);
    }

    onReturnBook(loanId: string): void {
        this.store.dispatch(new ReturnBook(loanId)).subscribe(() => this.onLoadLoans());
    }

    onLoadLoans(): void {
        this.dataSource.loadLoans({
            sortOrder: this.sort.direction || SortOrder.DESC, sortName: this.sort.active || TableColumns.LOAN_TIME,
            page: this.paginator.pageIndex || 0, pageSize: this.paginator.pageSize || 5,
            showOnlyDebtors: this.showOnlyDebtors, showOnlyReturned: this.showOnlyReturned,
            loanedAt: this.loanedAt
        });
    }

    ngOnDestroy(): void {}
}
