import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Loan } from '../models/loan.model';
import { Statistic } from '../models/statistic.model';

import { serverLink } from '../constants/serverLink';

import { HelperService } from './helper.service';
import { Response } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class LoansService {
    private LOANS_URL = `${serverLink}/loans`;
    private LOANS_STATISTIC_URL = `${this.LOANS_URL}/statistic`;

    private loans = new Subject<Loan[]>();

    private statistic = new Subject<Statistic[]>();

    constructor(
        private http: HttpClient,
        private helperService: HelperService
    ) {}

    setStatistic(statistic: Statistic[]): void {
        this.statistic.next(statistic);
    }

    getStatistic(): Observable<Statistic[]> {
        return this.statistic;
    }

    fetchLoansStatisticHttp(model: string, value: string) {
        return this.http
            .get(this.LOANS_STATISTIC_URL, {
                params: new HttpParams().set('model', model).set('value', value)
            })
            .pipe(
                map((response: Response) => {
                    this.setStatistic(response.data.statistic);
                })
            );
    }
}
