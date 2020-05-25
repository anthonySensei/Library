import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Order } from '../models/order.model';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private ORDERS_URL = `${serverLink}/orders`;

    private orders = new Subject<Order[]>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setOrders(orders: Order[]): void {
        this.orders.next(orders);
    }

    getOrders(): Observable<Order[]> {
        return this.orders;
    }

    fetchOrdersHttp() {
        return this.http
            .get(`${this.ORDERS_URL}`)
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

    loanBookFromOrderHttp(
        orderId: number,
        bookId: number,
        studentId: number,
        librarianEmail: string,
        loanTime: Date
    ) {
        return this.http
            .put(this.ORDERS_URL, {
                orderId,
                bookId,
                studentId,
                librarianEmail,
                loanTime
            })
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
