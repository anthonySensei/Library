import { Injectable } from '@angular/core';
import { serverLink } from '../constants/serverLink';
import { Subject } from 'rxjs';
import { Schedule } from '../models/schedule.model';
import { HttpClient } from '@angular/common/http';
import { ResponseService } from './response.service';
import { map } from 'rxjs/operators';
import { Period } from '../models/period.model';

@Injectable({
  providedIn: 'root'
})
export class PeriodService {
  PERIODS_URL = `${serverLink}/periods`;

  periodsChanged = new Subject<Period[]>();
  periods: Period[] = [];

  constructor(
      private http: HttpClient,
      private responseService: ResponseService
  ) {}

  setSchedule(periods: Period[]) {
    this.periods = periods;
    this.periodsChanged.next(this.periods);
  }

  getPeriods() {
    return this.periods;
  }

  fetchAllPeriodsHttp() {
    return this.http
        .get(`${this.PERIODS_URL}`)
        .pipe(
            map((response: any) => {
              this.setSchedule(response.data.genres);
            })
        );
  }

  addPeriodsHttp(schedule: Schedule) {
    return this.http.post(this.PERIODS_URL, { schedule }).pipe(
        map((response: any) => {
          this.responseService.setResponse(response.data);
        })
    );
  }

  ediPeriodsHttp(schedule: Schedule) {
    return this.http
        .put(this.PERIODS_URL, { schedule })
        .pipe(
            map((response: any) => {
              this.responseService.setResponse(response.data);
            })
        );
  }

  deletePeriodsHttp(scheduleId: number) {
    return this.http
        .delete(`${this.deletePeriodsHttp}?scheduleId=${scheduleId}`)
        .pipe(
            map((response: any) => {
              this.responseService.setResponse(response.data);
            })
        );
  }
}
