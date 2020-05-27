import {
    AfterViewInit,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Department } from '../../../../models/department.model';

import { OrdersDataSource } from '../../../../datasources/orders.datasource';

import { OrderService } from '../../../../services/orders.service';
import { HelperService } from '../../../../services/helper.service';

import { TableColumns } from '../../../../constants/tableColumns';
import { SortOrder } from '../../../../constants/sortOrder';

@Component({
    selector: 'app-orders-section',
    templateUrl: './orders-section.component.html'
})
export class OrdersSectionComponent
    implements OnInit, AfterViewInit, OnDestroy {
    @Input() studentId: number;
    @Input() departments: Department[];
    @Input() helperService: HelperService;

    mergeSubscription: Subscription;
    sortSubscription: Subscription;

    departmentSelect: number;

    columnsToDisplay: string[] = [
        TableColumns.ORDER_TIME,
        TableColumns.LOAN_TIME,
        TableColumns.BOOK_ISBN,
        TableColumns.DEPARTMENT_ADDRESS
    ];
    tableColumns = TableColumns;

    dataSource: OrdersDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingNotLoaned: boolean;

    constructor(private orderService: OrderService) {}

    ngOnInit() {
        this.dataSource = new OrdersDataSource(this.orderService);
        this.dataSource.loadOrders(
            '',
            '',
            SortOrder.DESC,
            0,
            5,
            null,
            null,
            false,
            this.studentId
        );
    }

    ngAfterViewInit(): void {
        this.sortSubscription = this.sort.sortChange.subscribe(
            () => (this.paginator.pageIndex = 0)
        );

        this.mergeSubscription = merge(
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
            this.departmentSelect,
            null,
            this.isShowingNotLoaned,
            this.studentId
        );
    }

    ngOnDestroy(): void {
        this.mergeSubscription.add(this.sortSubscription);
        this.mergeSubscription.unsubscribe();
    }
}
