import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Loan } from '../models/loan.model';

import { Statistic } from '../models/statistic.model';

@Injectable({
    providedIn: 'root'
})
export class LoansService {
    GET_BOOK_LOANS_URL = 'http://localhost:3000/loans';
    GET_LOANS_STATISTIC_URL = 'http://localhost:3000/loans-statistic';
    GET_TOP5_LOANS_URL = 'http://localhost:3000/loans-top';

    loansChanged = new Subject<Loan[]>();
    loans: Loan[];

    statisticChanged = new Subject<Statistic[]>();
    statistic: Statistic[];

    constructor(private http: HttpClient) {}

    setLoans(loans: Loan[]) {
        this.loans = loans;
        this.loansChanged.next(this.loans);
    }

    getLoans() {
        return this.loans;
    }

    setStatistic(statistic: Statistic[]) {
        this.statistic = statistic;
        this.statisticChanged.next(this.statistic);
    }

    getStatistic() {
        return this.statistic;
    }

    fetchBooksLoansHttp() {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.GET_BOOK_LOANS_URL}`, {
                headers
            })
            .pipe(
                map((response: any) => {
                    this.setLoans(response.data.loans);
                })
            );
    }

    fetchLoansStatisticHttp(model: string, value: string) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(
                `${this.GET_LOANS_STATISTIC_URL}?model=${model}&value=${value}`,
                {
                    headers
                }
            )
            .pipe(
                map((response: any) => {
                    this.setStatistic(response.data.statistic);
                })
            );
    }

    fetchTopFiveLoansHttp(model: string) {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.GET_TOP5_LOANS_URL}?model=${model}`, {
                headers
            })
            .pipe(
                map((response: any) => {
                    this.setStatistic(response.data.statistic);
                })
            );
    }
}
