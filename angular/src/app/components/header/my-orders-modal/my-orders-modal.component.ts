import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { OrdersDataSource } from '../../../datasources/orders.datasource';

import { untilDestroyed } from 'ngx-take-until-destroy';
import {Store} from '@ngxs/store';
import {BookState} from '../../../store/state/book.state';
import {StudentState} from '../../../store/state/student.state';
import {SortOrder} from '../../../constants/sortOrder';
import {TableColumns} from '../../../constants/tableColumns';

@Component({
    selector: 'app-add-option-dialog',
    templateUrl: './my-orders-modal.component.html'
})
export class MyOrdersModalComponent implements OnInit, AfterViewInit, OnDestroy {

    columnsToDisplay: string[] = ['librarian', 'book', 'orderedAt', 'loanedAt'];
    dataSource: OrdersDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        public dialogRef: MatDialogRef<MyOrdersModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { studentId: number },
        private store: Store
    ) {
    }

    ngOnInit(): void {
        this.dataSource = new OrdersDataSource(this.store);
        this.onLoadOrders();
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
        merge(
            this.sort.sortChange,
            this.paginator.page
        ).pipe(tap(() => this.onLoadOrders())).pipe(untilDestroyed(this)).subscribe();
    }

    getTotalItems(): number {
        return this.store.selectSnapshot(BookState.OrdersTotalItems);
    }

    onLoadOrders(): void {
        const user = this.store.selectSnapshot(StudentState.Student);
        this.dataSource.loadOrders({
            sortOrder: this.sort.direction || SortOrder.ASC, sortName: this.sort.active || TableColumns.LOAN_TIME,
            page: this.paginator.pageIndex || 0, pageSize: this.paginator.pageSize || 5, userId: user?._id
        });
    }

    ngOnDestroy(): void {}
}
