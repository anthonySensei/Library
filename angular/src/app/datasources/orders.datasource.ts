import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { GetOrdersModel, Order } from '../models/order.model';
import { Store } from '@ngxs/store';
import { LoadOrders } from '../store/state/book.state';
import { StoreStateModel } from '../store/models/store.model';

export class OrdersDataSource implements DataSource<Order> {
    private ordersSubject = new BehaviorSubject<Order[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private store: Store) {}

    loadOrders(params: GetOrdersModel) {
        this.loadingSubject.next(true);
        this.store
            .dispatch(new LoadOrders(params))
            .pipe(catchError(() => of([])), finalize(() => this.loadingSubject.next(false)))
            .subscribe((state: StoreStateModel) => this.ordersSubject.next(state.book.orders));
    }

    connect(collectionViewer: CollectionViewer): Observable<Order[]> {
        return this.ordersSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.ordersSubject.complete();
        this.loadingSubject.complete();
    }
}
