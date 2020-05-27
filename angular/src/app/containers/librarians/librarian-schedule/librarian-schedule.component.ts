import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Days } from '../../../constants/days';

import { ScheduleService } from '../../../services/schedule.service';
import { HelperService } from '../../../services/helper.service';

import { Schedule } from '../../../models/schedule.model';

@Component({
    selector: 'app-librarian-schedule',
    templateUrl: './librarian-schedule.component.html',
    styleUrls: ['./librarian-schedule.component.sass']
})
export class LibrarianScheduleComponent implements OnInit, OnDestroy {
    schedules: Schedule[];
    schedulesForDisplay: Schedule[];

    schedulesSubscription: Subscription;
    schedulesFetchSubscription: Subscription;

    mnSchedules: Schedule[];
    tsSchedules: Schedule[];
    wnSchedules: Schedule[];
    trSchedules: Schedule[];
    frSchedules: Schedule[];
    stSchedules: Schedule[];
    snSchedules: Schedule[];

    days = Object.values(Days);

    departmentSelect: number;
    librarianSelect: number;

    constructor(
        private scheduleService: ScheduleService,
        private helperService: HelperService
    ) {}

    ngOnInit(): void {
        this.subscriptionHandle();
    }

    subscriptionHandle(): void {
        this.schedulesFetchSubscription = this.scheduleService
            .fetchAllSchedulesHttp()
            .subscribe();
        this.schedulesSubscription = this.scheduleService
            .getSchedules()
            .subscribe((schedules: Schedule[]) => {
                this.schedules = schedules;
                this.setSchedules();
            });
    }

    getScheduleByDay(schedule: Schedule[], day: string): Schedule[] {
        return this.schedulesForDisplay.filter(sch => sch.day === day);
    }

    getCondition(sch): boolean {
        if (this.departmentSelect && this.librarianSelect) {
            return (
                sch.librarian.departmentId === this.departmentSelect &&
                sch.librarian.id === this.librarianSelect
            );
        } else if (this.departmentSelect) {
            return sch.librarian.departmentId === this.departmentSelect;
        } else if (this.librarianSelect) {
            return sch.librarian.id === this.librarianSelect;
        } else {
            return true;
        }
    }

    setSchedules(): void {
        this.schedulesForDisplay = this.schedules.filter(sch =>
            this.getCondition(sch)
        );
        this.setSchedulesByDay(this.schedulesForDisplay);
    }

    setSchedulesByDay(schedules: Schedule[]): void {
        this.mnSchedules = this.getScheduleByDay(schedules, this.days[0]);
        this.tsSchedules = this.getScheduleByDay(schedules, this.days[1]);
        this.wnSchedules = this.getScheduleByDay(schedules, this.days[2]);
        this.trSchedules = this.getScheduleByDay(schedules, this.days[3]);
        this.frSchedules = this.getScheduleByDay(schedules, this.days[4]);
        this.stSchedules = this.getScheduleByDay(schedules, this.days[5]);
        this.snSchedules = this.getScheduleByDay(schedules, this.days[6]);
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.schedulesSubscription, [
            this.schedulesFetchSubscription
        ]);
    }
}
