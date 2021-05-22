import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { Schedule } from '../../../models/schedule.model';
import RRule from 'rrule';
import { User } from '../../../models/user.model';
import { getByWeekDay, getWorkDayDate, getWorkDayTimePeriod } from '../../../helper/calendar';
import { Select, Store } from '@ngxs/store';
import { LoadSchedules, ScheduleState } from '../../../store/state/schedule.state';
import colors from '../../../constants/colors';
import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-librarian-schedule',
    templateUrl: './librarian-schedule.component.html',
    styleUrls: ['./librarian-schedule.component.scss']
})
export class LibrarianScheduleComponent implements OnInit, OnDestroy {

    actions: CalendarEventAction[] = [
        {
            label: '<span class="ml-1 text-main">Edit</span>',
            a11yLabel: 'Edit',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                this.onEventEdit(event);
            }
        },
        {
            label: '<span class="ml-1 text-main">Delete</span>',
            a11yLabel: 'Delete',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                this.onEventDelete(event);
            }
        }
    ];

    events: CalendarEvent[] = [];

    librarianSelect: number;

    @Select(ScheduleState.Schedules)
    schedules$: Observable<Schedule[]>;

    constructor(
        private store: Store
    ) {}

    ngOnInit(): void {
        this.store.dispatch(new LoadSchedules());
        this.getSchedules$();
    }

    getSchedules$() {
        this.schedules$.pipe(untilDestroyed(this)).subscribe(schedule => this.updateCalendar(schedule));
    }

    updateCalendar(schedules: Schedule[]) {
        this.events = [];
        schedules.forEach(schedule => {
            const byWeekday = getByWeekDay(schedule.weekDays);
            const rule = new RRule({
                freq: RRule.WEEKLY,
                byweekday: byWeekday,
                dtstart: new Date((schedule.librarian as User).createdAt),
                until: new Date(Date.UTC(new Date().getFullYear(), 12, 31))
            });
            rule.all().forEach(date => {
                this.events.push({
                    id: (schedule.librarian as User)._id,
                    start: getWorkDayDate(date, new Date(schedule.start)),
                    end: getWorkDayDate(date, new Date(schedule.end)),
                    title: `${ (schedule.librarian as User).name }: ${getWorkDayTimePeriod(new Date(schedule.start), new Date(schedule.end))}`,
                    color: colors.yellow,
                    actions: this.actions,
                    resizable: {
                        beforeStart: true,
                        afterEnd: true
                    },
                    draggable: true
                });
            });
        });
    }

    onEventEdit(event: CalendarEvent): void {
        console.log(event);
    }

    onEventDelete(event: CalendarEvent): void {
        console.log(event);
    }

    ngOnDestroy(): void {
    }
}
