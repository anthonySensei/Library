import { Component, OnInit } from '@angular/core';
import { Days } from '../../../constants/days';
import { ScheduleService } from '../../../services/schedule.service';
import { Schedule } from '../../../models/schedule.model';

@Component({
    selector: 'app-librarian-schedule',
    templateUrl: './librarian-schedule.component.html',
    styleUrls: ['./librarian-schedule.component.sass']
})
export class LibrarianScheduleComponent implements OnInit {
    schedules: Schedule[];

    mnSchedules: Schedule[];
    tsSchedules: Schedule[];
    wnSchedules: Schedule[];
    trSchedules: Schedule[];
    frSchedules: Schedule[];
    stSchedules: Schedule[];
    snSchedules: Schedule[];

    days = Object.values(Days);

    constructor(private scheduleService: ScheduleService) {}

    ngOnInit() {
        this.scheduleService.fetchAllSchedulesHttp().subscribe();
        this.scheduleService.schedulesChanged.subscribe(
            (schedules: Schedule[]) => {
                this.schedules = schedules;
                this.mnSchedules = this.getScheduleByDay(schedules, this.days[0]);
                this.tsSchedules = this.getScheduleByDay(schedules, this.days[1]);
                this.wnSchedules = this.getScheduleByDay(schedules, this.days[2]);
                this.trSchedules = this.getScheduleByDay(schedules, this.days[3]);
                this.frSchedules = this.getScheduleByDay(schedules, this.days[4]);
                this.stSchedules = this.getScheduleByDay(schedules, this.days[5]);
                this.snSchedules = this.getScheduleByDay(schedules, this.days[6]);
            }
        );
    }

    getScheduleByDay(schedule: Schedule[], day: string): Schedule[] {
        return schedule.filter(sch => sch.day === day);
    }
}
