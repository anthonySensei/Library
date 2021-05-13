import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { serverLink } from '../constants/serverLink';

import { Schedule } from '../models/schedule.model';
import { Response } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
    private SCHEDULES_URL = `${serverLink}/schedules`;

    private schedules = new Subject<Schedule[]>();

    constructor(private http: HttpClient) {}

    setSchedule(schedules: Schedule[]): void {
        this.schedules.next(schedules);
    }

    getSchedules(): Observable<Schedule[]> {
        return this.schedules;
    }

    fetchAllSchedulesHttp() {
        return this.http.get(this.SCHEDULES_URL).pipe(
            map((response: Response) => {
                this.setSchedule(response.data.schedules);
            })
        );
    }

    addScheduleHttp(schedule: Schedule) {
        return this.http.post(this.SCHEDULES_URL, { schedule }).pipe(map((response: Response) => response.data));
    }

    ediScheduleHttp(schedule: Schedule) {
        return this.http.put(this.SCHEDULES_URL, { schedule }).pipe(map((response: Response) => response.data));
    }

    deleteScheduleHttp(scheduleId: number) {
        return this.http
            .delete(this.SCHEDULES_URL, {
                params: new HttpParams().set(
                    'scheduleId',
                    scheduleId.toString()
                )
            })
            .pipe(map((response: Response) => response.data));
    }
}
