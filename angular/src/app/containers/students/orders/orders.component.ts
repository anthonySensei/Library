import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoanBookFromOrderModel, Order } from '../../../models/order.model';

import { OrdersDataSource } from '../../../datasources/orders.datasource';

import { TableColumns } from '../../../constants/tableColumns';
import { PageTitles } from '../../../constants/pageTitles';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TABLE_ANIMATION } from '../../../constants/animation';
import { Store } from '@ngxs/store';
import { SortOrder } from '../../../constants/sortOrder';
import { BookState, LoanBookFromOrder } from '../../../store/state/book.state';
import { Book } from '../../../models/book.model';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    animations: TABLE_ANIMATION
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {

    filterValue: string;
    showOnlyNotLoaned: boolean;
    showOnlyLoaned: boolean;
    orders: Order[];
    orderedAt: Date;
    loanedAt: Date;

    columnsToDisplay: string[] = ['user', 'librarian', 'book', 'orderedAt', 'loanedAt'];
    expandedElement: Order | null;

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

    onLoanBook(order: Order) {
        const data: LoanBookFromOrderModel = { orderId: order._id, bookId: (order.book as Book)._id, userId: (order.user as User)._id };
        this.store.dispatch(new LoanBookFromOrder(data)).subscribe(() => this.onLoadOrders());
    }

    onLoadOrders(): void {
        this.dataSource.loadOrders({
            sortOrder: this.sort.direction, sortName: this.sort.active, page: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize || 5, showOnlyNotLoaned: this.showOnlyNotLoaned, showOnlyLoaned: this.showOnlyLoaned,
            loanedAt: this.loanedAt, orderedAt: this.orderedAt
        });
    }

    ngOnDestroy(): void {}
}
