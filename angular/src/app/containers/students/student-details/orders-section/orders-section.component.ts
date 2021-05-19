import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { OrdersDataSource } from '../../../../datasources/orders.datasource';

import { OrderService } from '../../../../services/orders.service';

import { TableColumns } from '../../../../constants/tableColumns';
import { SortOrder } from '../../../../constants/sortOrder';

@Component({
    selector: 'app-orders-section',
    templateUrl: './orders-section.component.html'
})
export class OrdersSectionComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() studentId: number;

    columnsToDisplay: string[] = [
        TableColumns.ORDER_TIME,
        TableColumns.LOAN_TIME,
        TableColumns.BOOK_ISBN,
    ];
    tableColumns = TableColumns;

    dataSource: OrdersDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingNotLoaned: boolean;

    constructor(private orderService: OrderService) {
    }

    ngOnInit() {
        // this.dataSource = new OrdersDataSource(this.orderService);
        // this.dataSource.loadOrders(
        //     '',
        //     '',
        //     SortOrder.DESC,
        //     0,
        //     5,
        //     null,
        //     null,
        //     false,
        //     this.studentId
        // );
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(
            () => (this.paginator.pageIndex = 0)
        );

        merge(
            this.sort.sortChange,
            this.paginator.page
        )
            .pipe(tap(() => this.loadOrdersPage()))
            .subscribe();
    }

    loadOrdersPage(): void {
        this.dataSource.loadOrders(
            null,
            null,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize,
            null,
            this.isShowingNotLoaned,
            this.studentId
        );
    }

    ngOnDestroy(): void {
    }
}
