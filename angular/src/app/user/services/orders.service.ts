import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Order } from '../models/order.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    GET_BOOK_ORDERS_URL = 'http://localhost:3000/orders';

    ordersChanged = new Subject<Order[]>();
    orders: Order[];

    constructor(private http: HttpClient) {}

    setOrders(orders: Order[]) {
        this.orders = orders;
        this.ordersChanged.next(this.orders);
    }

    getOrders() {
        return this.orders;
    }

    fetchBookOrdersHttp() {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.GET_BOOK_ORDERS_URL}`, {
                headers
            })
            .pipe(
                map((response: any) => {
                    this.setOrders(response.data.orders);
                })
            );
    }
}
