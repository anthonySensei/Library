import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { OrdersDataSource } from '../../../datasources/orders.datasource';

import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-add-option-dialog',
    templateUrl: './my-orders-modal.component.html'
})
export class MyOrdersModalComponent implements OnInit, AfterViewInit, OnDestroy {

    columnsToDisplay: string[] = [
        'orderTime',
        'loanTime',
        'bookISBN',
    ];

    dataSource: OrdersDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        public dialogRef: MatDialogRef<MyOrdersModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { studentId: number }
    ) {
    }

    ngOnInit(): void {
        // this.dataSource.loadOrders(
        //     '',
        //     '',
        //     SortOrder.DESC,
        //     0,
        //     5,
        //     null,
        //     null,
        //     true,
        //     this.data.studentId
        // );
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.pipe(untilDestroyed(this)).subscribe(() => (this.paginator.pageIndex = 0));

        merge(
            this.sort.sortChange,
            this.paginator.page
        )
            .pipe(tap(() => this.loadOrdersPage()))
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    loadOrdersPage(): void {
        // this.dataSource.loadOrders(
        //     null,
        //     null,
        //     this.sort.direction,
        //     this.paginator.pageIndex,
        //     this.paginator.pageSize,
        //     null,
        //     true,
        //     this.data.studentId
        // );
    }

    ngOnDestroy(): void {
    }
}
