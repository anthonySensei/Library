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
import { User } from '../../../models/user.model';

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
    user: User;
    orders: Order[];

    response: Response;

    snackbarDuration = 3000;

    ordersSubscription: Subscription;
    ordersFetchSubscription: Subscription;
    userSubscription: Subscription;
    loanBookSubscription: Subscription;

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

    ngOnInit(): void {
        document.title = 'Loans';
        this.setOrders();
        this.subscriptionsHandle();
    }

    setOrders(): void {
        this.ordersFetchSubscription = this.orderService
            .fetchOrdersHttp()
            .subscribe();
        this.ordersSubscription = this.orderService
            .getOrders()
            .subscribe(orders => {
                this.orders = orders;
                this.dataSource = new MatTableDataSource(this.orders);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            });
    }

    subscriptionsHandle(): void {
        this.userSubscription = this.authService
            .getUser()
            .subscribe((user: User) => {
                this.user = user;
            });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
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
                this.response = this.responseService.getResponse();
                if (this.response.isSuccessful) {
                    this.materialService.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                    this.setOrders();
                } else {
                    this.materialService.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Danger,
                        this.snackbarDuration
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.ordersSubscription.add(this.ordersFetchSubscription);
        this.ordersSubscription.add(this.userSubscription);
        this.ordersSubscription.add(this.loanBookSubscription);
        this.ordersSubscription.unsubscribe();
    }
}
