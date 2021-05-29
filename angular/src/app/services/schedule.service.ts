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

    getSchedules(librarianId: string) {
        const params = librarianId ? `?librarianId=${librarianId}` : '';
        return this.http.get(this.SCHEDULES_URL + params).pipe(map((response: Response) => response.data));
    }

    createSchedule(schedule: Schedule) {
        return this.http.post(this.SCHEDULES_URL, { schedule }).pipe(map((response: Response) => response.data));
    }

    editSchedule(id: string, schedule: Schedule) {
        return this.http.put(`${this.SCHEDULES_URL}/${id}`, { schedule }).pipe(map((response: Response) => response.data));
    }

    deleteSchedule(id: string) {
        return this.http.delete(`${this.SCHEDULES_URL}/${id}`).pipe(map((response: Response) => response.data));
    }
}
