import {
    AfterViewInit,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Department } from '../../../models/department.model';
import { HelperService } from '../../../services/helper.service';
import { merge, Subscription } from 'rxjs';
import { OrdersDataSource } from '../../../datasources/orders.datasource';
import { MatPaginator, MatSort } from '@angular/material';
import { OrderService } from '../../../services/orders.service';
import { DepartmentService } from '../../../services/department.service';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-add-option-dialog',
    templateUrl: './my-orders-modal.component.html'
})
export class MyOrdersModalComponent
    implements OnInit, AfterViewInit, OnDestroy {
    departments: Department[];

    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    mergeSubscription: Subscription;
    sortSubscription: Subscription;

    departmentSelect: number;

    columnsToDisplay: string[] = [
        'orderTime',
        'loanTime',
        'bookISBN',
        'departmentAddress'
    ];

    dataSource: OrdersDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingNotLoaned: boolean;

    constructor(
        private orderService: OrderService,
        private departmentService: DepartmentService,
        private helperService: HelperService,
        public dialogRef: MatDialogRef<MyOrdersModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { studentId: number }
    ) {}

    ngOnInit(): void {
        this.dataSource = new OrdersDataSource(this.orderService);
        this.dataSource.loadOrders(
            '',
            '',
            'desc',
            0,
            5,
            null,
            null,
            false,
            this.data.studentId
        );
        this.subscriptionsHandle();
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
            this.data.studentId
        );
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.departmentsSubscription, [
            this.departmentsFetchSubscription,
            this.mergeSubscription,
            this.sortSubscription
        ]);
    }
}
