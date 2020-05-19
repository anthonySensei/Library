import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

import { Subscription } from 'rxjs';

import { Order } from '../../../models/order.model';
import { Response } from '../../../models/response.model';

import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

import { OrderService } from '../../../services/orders.service';
import { MaterialService } from '../../../services/material.service';
import { ResponseService } from '../../../services/response.service';
import { AuthService } from '../../../services/auth.service';

import { SnackBarClasses } from '../../../constants/snackBarClasses';

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
export class OrdersComponent implements OnInit, OnDestroy {
    orders: Order[];

    response: Response;

    snackbarDuration = 3000;

    ordersSubscription: Subscription;
    ordersChangedSubscription: Subscription;

    columnsToDisplay: string[] = [
        'orderTime',
        'loanTime',
        'bookISBN',
        'studentReaderTicket',
        'departmentAddress'
    ];
    expandedElement: Order | null;

    dataSource: MatTableDataSource<Order>;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        private orderService: OrderService,
        private authService: AuthService,
        private materialService: MaterialService,
        private responseService: ResponseService
    ) {}

    ngOnInit() {
        document.title = 'Loans';
        this.subscriptionsHandle();
    }

    subscriptionsHandle(): void {
        this.ordersSubscription = this.orderService
            .fetchOrdersHttp()
            .subscribe();
        this.ordersChangedSubscription = this.orderService.ordersChanged.subscribe(
            orders => {
                this.orders = orders;
                this.dataSource = new MatTableDataSource(this.orders);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            }
        );
        this.orders = this.orderService.getOrders();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    ngOnDestroy(): void {
        this.ordersSubscription.unsubscribe();
        this.ordersChangedSubscription.unsubscribe();
    }

    orderBook(orderId: number, bookId: number, studentId: number) {
        this.orderService
            .loanBookFromOrderHttp(
                orderId,
                bookId,
                studentId,
                this.authService.getUser().email,
                new Date()
            )
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                if (this.response.isSuccessful) {
                    this.materialService.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                    this.orderService.fetchOrdersHttp().subscribe();
                    this.orders = this.orderService.getOrders();
                } else {
                    this.materialService.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Danger,
                        this.snackbarDuration
                    );
                }
            });
    }
}
