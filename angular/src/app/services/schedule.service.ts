import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { serverLink } from '../constants/serverLink';

import { Schedule } from '../models/schedule.model';
import { Response } from '../models/response.model';
import { Author } from '../models/author.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
    private SCHEDULES_URL = `${serverLink}/schedules`;

    constructor(private http: HttpClient) {}

    getSchedules() {
        return this.http.get(this.SCHEDULES_URL).pipe(map((response: Response) => response.data));
    }

    createSchedules(schedule: Schedule) {
        return this.http.post(this.SCHEDULES_URL, { schedule }).pipe(map((response: Response) => response.data));
    }

    editSchedules(id: string, author: Schedule) {
        return this.http.put(`${this.SCHEDULES_URL}/${id}`, { author }).pipe(map((response: Response) => response.data));
    }

    deleteSchedules(id: string) {
        return this.http.delete(`${this.SCHEDULES_URL}/${id}`).pipe(map((response: Response) => response.data));
    }
}
