import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Order } from '../models/order.model';
import { OrderService } from '../services/orders.service';

export class OrdersDataSource implements DataSource<Order> {
    private ordersSubject = new BehaviorSubject<Order[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private orderService: OrderService) {}

    loadOrders(
        filterName: string,
        filterValue: string,
        sortOrder: string,
        pageIndex: number,
        pageSize: number,
        departmentId: number,
        orderDate: Date,
        isShowNotLoaned: boolean,
        studentId: number = null
    ) {
        this.loadingSubject.next(true);

        this.orderService
            .fetchOrdersHttp(
                filterName,
                filterValue,
                sortOrder,
                pageIndex,
                pageSize,
                departmentId,
                orderDate,
                isShowNotLoaned,
                studentId
            )
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((orders: Order[]) => this.ordersSubject.next(orders));
    }

    connect(collectionViewer: CollectionViewer): Observable<Order[]> {
        return this.ordersSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.ordersSubject.complete();
        this.loadingSubject.complete();
    }
}
