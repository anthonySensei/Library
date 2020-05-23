import { Injectable } from '@angular/core';
import { serverLink } from '../constants/serverLink';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ResponseService } from './response.service';
import { map } from 'rxjs/operators';
import { Period } from '../models/period.model';

@Injectable({
    providedIn: 'root'
})
export class PeriodService {
    private PERIODS_URL = `${serverLink}/periods`;

    private periods = new Subject<Period[]>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setPeriods(periods: Period[]): void {
        this.periods.next(periods);
    }

    getPeriods(): Observable<Period[]> {
        return this.periods;
    }

    fetchAllPeriodsHttp() {
        return this.http.get(`${this.PERIODS_URL}`).pipe(
            map((response: any) => {
                this.setPeriods(response.data.periods);
            })
        );
    }

    addPeriodsHttp(period: Period) {
        return this.http.post(this.PERIODS_URL, { period }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    ediPeriodsHttp(period: Period) {
        return this.http.put(this.PERIODS_URL, { period }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    deletePeriodsHttp(periodId: number) {
        return this.http
            .delete(`${this.PERIODS_URL}?periodId=${periodId}`)
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
