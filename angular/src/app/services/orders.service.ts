import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { serverLink } from '../constants/serverLink';
import { Response } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private ORDERS_URL = `${serverLink}/orders`;

    constructor(private http: HttpClient) {}

    orderBookHttp(orderInfo) {
        return this.http.post(this.ORDERS_URL, orderInfo).pipe(map((response: Response) => response.data));
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
            .pipe(map((response: Response) => response.data));
    }
}
