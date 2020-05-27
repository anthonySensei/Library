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

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.sass'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition(
                'expanded <=> collapsed',
                animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
            )
        ])
    ]
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
    user: User;
    orders: Order[];
    departments: Department[];

    mergeSubscription: Subscription;
    sortSubscription: Subscription;
    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    userSubscription: Subscription;
    loanBookSubscription: Subscription;

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
        private helperService: HelperService,
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

    subscriptionsHandle(): void {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
            });
        this.userSubscription = this.authService
            .getUser()
            .subscribe((user: User) => {
                this.user = user;
            });
    }

    loanBook(orderId: number, bookId: number, studentId: number) {
        this.loanBookSubscription = this.orderService
            .loanBookFromOrderHttp(
                orderId,
                bookId,
                studentId,
                this.user.email,
                new Date()
            )
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

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.userSubscription, [
            this.loanBookSubscription,
            this.departmentsSubscription,
            this.departmentsFetchSubscription,
            this.mergeSubscription,
            this.sortSubscription
        ]);
    }
}
