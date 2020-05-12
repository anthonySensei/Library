import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Order } from '../models/order.model';

import { ResponseService } from '../../shared/services/response.service';

import { serverLink } from '../../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    ORDERS_URL = `${serverLink}/orders`;

    ordersChanged = new Subject<Order[]>();
    orders: Order[];

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

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
            .get(`${this.ORDERS_URL}`, {
                headers
            })
            .pipe(
                map((response: any) => {
                    this.setOrders(response.data.orders);
                })
            );
    }

    orderBookHttp(orderInfo) {
        return this.http.post(this.ORDERS_URL, orderInfo).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }
}
