import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { OrdersDataSource } from '../../../../datasources/orders.datasource';

import { TableColumns } from '../../../../constants/tableColumns';
import { Order } from '../../../../models/order.model';
import { Store } from '@ngxs/store';
import { PageTitles } from '../../../../constants/pageTitles';
import { SortOrder } from '../../../../constants/sortOrder';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { BookState } from '../../../../store/state/book.state';
import { StudentState } from '../../../../store/state/student.state';

@Component({
    selector: 'app-orders-section',
    templateUrl: './orders-section.component.html'
})
export class OrdersSectionComponent implements OnInit, AfterViewInit, OnDestroy {

    filterValue: string;
    showOnlyNotLoaned: boolean;
    showOnlyLoaned: boolean;
    orders: Order[];
    orderedAt: Date;
    loanedAt: Date;

    columnsToDisplay: string[] = ['librarian', 'book', 'orderedAt', 'loanedAt'];

    dataSource: OrdersDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(private store: Store) {}

    ngOnInit(): void {
        document.title = PageTitles.ORDERS;
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
            page: this.paginator.pageIndex || 0, pageSize: this.paginator.pageSize || 5,
            showOnlyNotLoaned: this.showOnlyNotLoaned, showOnlyLoaned: this.showOnlyLoaned,
            loanedAt: this.loanedAt, orderedAt: this.orderedAt, userId: user?._id
        });
    }

    ngOnDestroy(): void {}
}
