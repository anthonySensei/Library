import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OrderService } from '../../services/orders.service';
import { Subscription } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Order } from '../../models/order.model';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

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

    ordersSubscription: Subscription;
    ordersChangedSubscription: Subscription;

    columnsToDisplay: string[] = [
        'orderTime',
        'bookISBN',
        'studentReaderTicket',
        'departmentAddress'
    ];
    expandedElement: Order | null;

    dataSource: MatTableDataSource<Order>;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(private orderService: OrderService) {}

    ngOnInit() {
        document.title = 'Loans';
        this.subscriptionsHandle();
    }

    subscriptionsHandle(): void {
        this.ordersSubscription = this.orderService
            .fetchBookOrdersHttp()
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
}
