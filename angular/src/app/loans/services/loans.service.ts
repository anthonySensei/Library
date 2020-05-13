import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Loan } from '../models/loan.model';
import { Statistic } from '../models/statistic.model';

import { serverLink } from '../../constants/serverLink';
import { ResponseService } from '../../shared/services/response.service';

@Injectable({
    providedIn: 'root'
})
export class LoansService {
    LOANS_URL = `${serverLink}/loans`;
    LOANS_STATISTIC_URL = `${this.LOANS_URL}/statistic`;
    LOANS_STATISTIC_TOP_URL = `${this.LOANS_STATISTIC_URL}/top`;

    loansChanged = new Subject<Loan[]>();
    loans: Loan[];

    statisticChanged = new Subject<Statistic[]>();
    statistic: Statistic[];

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

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

    fetchLoansHttp() {
        const headers = new HttpHeaders();
        headers.append('Content-type', 'application/json');
        return this.http
            .get(`${this.LOANS_URL}`, {
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
            .get(`${this.LOANS_STATISTIC_URL}?model=${model}&value=${value}`, {
                headers
            })
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
            .get(`${this.LOANS_STATISTIC_TOP_URL}?model=${model}`, {
                headers
            })
            .pipe(
                map((response: any) => {
                    this.setStatistic(response.data.statistic);
                })
            );
    }

    returnBookHttp(loanId: number, bookId: number, returnedTime: Date) {
        const updatedData = {
            loanId,
            bookId,
            returnedTime
        };
        return this.http.put(`${this.LOANS_URL}`, updatedData).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }
}
