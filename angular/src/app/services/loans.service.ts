import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Loan } from '../models/loan.model';
import { Statistic } from '../models/statistic.model';

import { serverLink } from '../constants/serverLink';
import { ResponseService } from './response.service';

@Injectable({
    providedIn: 'root'
})
export class LoansService {
    private LOANS_URL = `${serverLink}/loans`;
    private LOANS_STATISTIC_URL = `${this.LOANS_URL}/statistic`;
    private LOANS_STATISTIC_TOP_URL = `${this.LOANS_STATISTIC_URL}/top`;

    private loans = new Subject<Loan[]>();

    private statistic = new Subject<Statistic[]>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setLoans(loans: Loan[]): void {
        this.loans.next(loans);
    }

    getLoans(): Observable<Loan[]> {
        return this.loans;
    }

    setStatistic(statistic: Statistic[]): void {
        this.statistic.next(statistic);
    }

    getStatistic(): Observable<Statistic[]> {
        return this.statistic;
    }

    fetchLoansHttp(departmentId: number, studentId: number, loanDate: Date) {
        let nextDay;
        if (loanDate) {
            nextDay = new Date();
            nextDay.setDate(loanDate.getDate() + 1);
        }
        return this.http
            .get(
                `${this.LOANS_URL}?` +
                    `departmentId=${departmentId}&` +
                    `studentId=${studentId}&` +
                    `loanDate=${loanDate}&` +
                    `nextDay=${nextDay}`
            )
            .pipe(
                map((response: any) => {
                    this.setLoans(response.data.loans);
                })
            );
    }

    fetchLoansStatisticHttp(model: string, value: string) {
        return this.http
            .get(`${this.LOANS_STATISTIC_URL}?model=${model}&value=${value}`)
            .pipe(
                map((response: any) => {
                    this.setStatistic(response.data.statistic);
                })
            );
    }

    fetchTopFiveLoansHttp(model: string) {
        return this.http
            .get(`${this.LOANS_STATISTIC_TOP_URL}?model=${model}`)
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
