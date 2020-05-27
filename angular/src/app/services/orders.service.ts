import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Order } from '../models/order.model';

import { ResponseService } from './response.service';
import { HelperService } from './helper.service';

import { serverLink } from '../constants/serverLink';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private ORDERS_URL = `${serverLink}/orders`;

    constructor(
        private http: HttpClient,
        private responseService: ResponseService,
        private helperService: HelperService
    ) {}

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
