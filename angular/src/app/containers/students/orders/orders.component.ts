import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Order } from '../../../models/order.model';
import { User } from '../../../models/user.model';

import { OrdersDataSource } from '../../../datasources/orders.datasource';

import { TableColumns } from '../../../constants/tableColumns';
import { PageTitles } from '../../../constants/pageTitles';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TABLE_ANIMATION } from '../../../constants/animation';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/state/user.state';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    animations: TABLE_ANIMATION
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {

    filterName: string;
    filterValue: string;
    showOnlyNotLoaned: boolean;
    showOnlyLoaned: boolean;
    user: User;
    orders: Order[];
    orderedAt: Date;

    columnsToDisplay: string[] = ['user', 'librarian', 'book', 'orderedAt', 'loanedAt'];
    expandedElement: Order | null;
    tableColumns = TableColumns;

    dataSource: OrdersDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingNotLoaned: boolean;

    @Select(UserState.User)
    user$: Observable<User>;

    constructor(private store: Store) {}

    ngOnInit(): void {
        document.title = PageTitles.ORDERS;
        this.dataSource = new OrdersDataSource(this.store);
        // this.dataSource.loadOrders(
        //     '',
        //     '',
        //     SortOrder.DESC,
        //     0,
        //     5,
        //     null,
        //     null,
        //     false
        // );
        this.subscriptionsHandle();
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(
            this.sort.sortChange,
            this.paginator.page
        ).pipe(tap(() => this.loadOrdersPage())).pipe(untilDestroyed(this)).subscribe();
    }

    getTotalItems(): number {
        return 0;
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => this.user = user || {} as User);
    }

    subscriptionsHandle(): void {
        this.getUser$();
    }

    loanBook(orderId: number, bookId: number, studentId: number) {
        // this.orderService.loanBookFromOrderHttp(
        //         orderId,
        //         bookId,
        //         studentId,
        //         this.user.email,
        //         new Date()
        //     )
        //     .pipe(untilDestroyed(this))
        //     .subscribe(() => {
        //     });
    }

    loadOrdersPage(): void {
        if (!this.filterName) {
            this.filterValue = '';
        }
        this.dataSource.loadOrders(
            this.filterName,
            this.filterValue,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.orderedAt,
            this.isShowingNotLoaned
        );
    }

    onLoadOrders() {}

    ngOnDestroy(): void {}

    onLoanBook(id: string) {}
}
