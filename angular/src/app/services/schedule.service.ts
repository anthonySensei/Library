import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { serverLink } from '../constants/serverLink';

import { ResponseService } from './response.service';

import { Schedule } from '../models/schedule.model';

@Injectable({
    providedIn: 'root'
})
export class ScheduleService {
    private SCHEDULES_URL = `${serverLink}/schedules`;

    private schedules = new Subject<Schedule[]>();

    constructor(
        private http: HttpClient,
        private responseService: ResponseService
    ) {}

    setSchedule(schedules: Schedule[]): void {
        this.schedules.next(schedules);
    }

    getSchedules(): Observable<Schedule[]> {
        return this.schedules;
    }

    fetchAllSchedulesHttp() {
        return this.http.get(`${this.SCHEDULES_URL}`).pipe(
            map((response: any) => {
                this.setSchedule(response.data.schedules);
            })
        );
    }

    addScheduleHttp(schedule: Schedule) {
        return this.http.post(this.SCHEDULES_URL, { schedule }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    ediScheduleHttp(schedule: Schedule) {
        return this.http.put(this.SCHEDULES_URL, { schedule }).pipe(
            map((response: any) => {
                this.responseService.setResponse(response.data);
            })
        );
    }

    deleteScheduleHttp(scheduleId: number) {
        return this.http
            .delete(`${this.SCHEDULES_URL}?scheduleId=${scheduleId}`)
            .pipe(
                map((response: any) => {
                    this.responseService.setResponse(response.data);
                })
            );
    }
}
