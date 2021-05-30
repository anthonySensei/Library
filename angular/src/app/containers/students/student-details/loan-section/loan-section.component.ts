import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoansDataSource } from '../../../../datasources/loans.datasource';

import { TableColumns } from '../../../../constants/tableColumns';
import { Store } from '@ngxs/store';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { BookState } from '../../../../store/state/book.state';
import { LibrarianState } from '../../../../store/state/librarian.state';
import { SortOrder } from '../../../../constants/sortOrder';
import { StudentState } from '../../../../store/state/student.state';

@Component({
    selector: 'app-loan-section',
    templateUrl: './loan-section.component.html',
    styleUrls: ['./loan-section.component.sass']
})
export class LoanSectionComponent implements OnInit, AfterViewInit, OnDestroy {

    showOnlyDebtors: boolean;
    showOnlyReturned: boolean;
    columnsToDisplay: string[] = ['librarian', 'book', 'loanedAt', 'returnedAt'];
    loanedAt: Date;

    tableColumns = TableColumns;
    dataSource: LoansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(public store: Store) {}

    ngOnInit(): void {
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

    onLoadLoans(): void {
        const user = this.store.selectSnapshot(StudentState.Student);
        this.dataSource.loadLoans({
            sortOrder: this.sort.direction || SortOrder.DESC, sortName: this.sort.active || TableColumns.LOAN_TIME,
            page: this.paginator.pageIndex || 0, pageSize: this.paginator.pageSize || 0,
            showOnlyDebtors: this.showOnlyDebtors, showOnlyReturned: this.showOnlyReturned,
            loanedAt: this.loanedAt, userId: user?._id
        });
    }

    ngOnDestroy(): void {}
}
