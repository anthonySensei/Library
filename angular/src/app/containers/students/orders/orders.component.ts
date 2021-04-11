import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Order } from '../../../models/order.model';
import { User } from '../../../models/user.model';
import { Department } from '../../../models/department.model';

import { OrderService } from '../../../services/orders.service';
import { ResponseService } from '../../../services/response.service';
import { AuthService } from '../../../services/auth.service';
import { HelperService } from '../../../services/helper.service';
import { DepartmentService } from '../../../services/department.service';

import { OrdersDataSource } from '../../../datasources/orders.datasource';

import { TableColumns } from '../../../constants/tableColumns';
import { PageTitles } from '../../../constants/pageTitles';
import { SortOrder } from '../../../constants/sortOrder';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TABLE_ANIMATION } from '../../../constants/animation';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    animations: TABLE_ANIMATION
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
    user: User;
    orders: Order[];
    departments: Department[];

    filterName: string;
    filterValue: string;
    departmentSelect: number;
    date: Date = null;

    columnsToDisplay: string[] = [
        TableColumns.ORDER_TIME,
        TableColumns.LOAN_TIME,
        TableColumns.BOOK_ISBN,
        TableColumns.READER_TICKET,
        TableColumns.DEPARTMENT_ADDRESS
    ];
    expandedElement: Order | null;
    tableColumns = TableColumns;

    dataSource: OrdersDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingNotLoaned: boolean;

    constructor(
        private orderService: OrderService,
        private authService: AuthService,
        private departmentService: DepartmentService,
        public helperService: HelperService,
        private responseService: ResponseService
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.ORDERS;
        this.dataSource = new OrdersDataSource(this.orderService);
        this.dataSource.loadOrders(
            '',
            '',
            SortOrder.DESC,
            0,
            5,
            null,
            null,
            false
        );
        this.subscriptionsHandle();
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(
            () => (this.paginator.pageIndex = 0)
        );

        merge(
            this.sort.sortChange,
            this.paginator.page
        ).pipe(tap(() => this.loadOrdersPage())).pipe(untilDestroyed(this)).subscribe();
    }

    subscriptionsHandle(): void {
        this.departmentService.fetchAllDepartmentsHttp().pipe(untilDestroyed(this)).subscribe();
        this.departmentService.getDepartments().pipe(untilDestroyed(this)).subscribe((departments: Department[]) => {
            this.departments = departments;
        });
        this.authService.getUser().subscribe((user: User) => {
            this.user = user;
        });
    }

    loanBook(orderId: number, bookId: number, studentId: number) {
        this.orderService.loanBookFromOrderHttp(
                orderId,
                bookId,
                studentId,
                this.user.email,
                new Date()
            )
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                if (this.responseService.responseHandle()) {
                    this.loadOrdersPage();
                }
            });
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
            this.departmentSelect,
            this.date,
            this.isShowingNotLoaned
        );
    }

    ngOnDestroy(): void {}
}
