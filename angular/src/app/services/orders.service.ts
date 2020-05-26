import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Order } from '../models/order.model';

import { ResponseService } from './response.service';

import { serverLink } from '../constants/serverLink';
import { HelperService } from './helper.service';
import { log } from 'util';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private ORDERS_URL = `${serverLink}/orders`;

    private orders = new Subject<Order[]>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService,
        private helperService: HelperService
    ) {}

    setOrders(orders: Order[]): void {
        this.orders.next(orders);
    }

    getOrders(): Observable<Order[]> {
        return this.orders;
    }

    fetchOrdersHttp(
        filterName: string = '',
        filterValue: string = '',
        sortOrder = 'desc',
        pageNumber = 0,
        pageSize = 5,
        departmentId: number = null,
        orderDate: Date = null,
        isShowNotLoaned = false,
        studentId: number = null
    ): Observable<Order[]> {
        let nextDay: Date;
        if (orderDate) {
            nextDay = new Date();
            nextDay.setDate(orderDate.getDate() + 1);
        }
        return this.http
            .get(this.ORDERS_URL, {
                params: new HttpParams()
                    .set('filterName', filterName ? filterName : '')
                    .set('filterValue', filterValue)
                    .set('sortOrder', sortOrder)
                    .set('pageNumber', (pageNumber + 1).toString())
                    .set('pageSize', pageSize.toString())
                    .set(
                        'departmentId',
                        departmentId ? departmentId.toString() : ''
                    )
                    .set('orderDate', orderDate ? orderDate.toDateString() : '')
                    .set('nextDay', nextDay ? nextDay.toDateString() : '')
                    .set('isShowNotLoaned', isShowNotLoaned.toString())
                    .set(
                        'studentId',
                        studentId ? studentId.toString() : ''
                    )
            })
            .pipe(
                map((response: any) => {
                    this.setOrders(response.data.orders);
                    this.helperService.setItemsPerPage(response.data.quantity);
                    return response.data.orders;
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
