import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoansDataSource } from '../../../../datasources/loans.datasource';

import { TableColumns } from '../../../../constants/tableColumns';
import { Store } from '@ngxs/store';

@Component({
    selector: 'app-loan-section',
    templateUrl: './loan-section.component.html',
    styleUrls: ['./loan-section.component.sass']
})
export class LoanSectionComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() studentId: number;

    columnsToDisplay: string[] = [
        TableColumns.LOAN_TIME,
        TableColumns.RETURNED_TIME,
        TableColumns.BOOK_ISBN,
        TableColumns.EMAIL
    ];
    tableColumns = TableColumns;

    dataSource: LoansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingDebtors: boolean;

    constructor(private store: Store) {}

    ngOnInit(): void {
        this.dataSource = new LoansDataSource(this.store);
        this.dataSource.loadLoans({
                sortOrder: this.sort.direction, sortName: this.sort.active || TableColumns.LOAN_TIME, page: 0,
                pageSize: this.paginator.pageSize || 5,
            });
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(
            () => (this.paginator.pageIndex = 0)
        );

        merge(
            this.sort.sortChange,
            this.paginator.page
        )
            .pipe(tap(() => this.onLoadLoansPage()))
            .subscribe();
    }

    onLoadLoansPage(): void {
        this.dataSource.loadLoans({
            sortOrder: this.sort.direction, sortName: this.sort.active, page: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize
        });
    }

    ngOnDestroy(): void {}
}
