import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { addDays, addHours, endOfMonth, startOfDay, subDays } from 'date-fns';
import { Select, Store } from '@ngxs/store';
import { LoadSchedules, ScheduleState } from '../../../../store/state/schedule.state';
import { Observable } from 'rxjs';
import { Schedule } from '../../../../models/schedule.model';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { getCalendarEvents } from '../../../../helper/calendar';
import { LibrarianState } from '../../../../store/state/librarian.state';

@Component({
    selector: 'app-schedule-section',
    templateUrl: './schedule-section.component.html'
})
export class ScheduleSectionComponent implements OnInit, OnDestroy {

    events: CalendarEvent[] = [];

    @Select(ScheduleState.Schedules)
    schedules$: Observable<Schedule[]>;

    constructor(
        private store: Store,
    ) {}

    ngOnInit(): void {
        const librarian = this.store.selectSnapshot(LibrarianState.Librarian);
        this.store.dispatch(new LoadSchedules(librarian?._id));
        this.getSchedules$();
    }

    getSchedules$() {
        this.schedules$.pipe(untilDestroyed(this)).subscribe(schedule => this.updateCalendar(schedule));
    }

    updateCalendar(schedules: Schedule[]) {
        this.events = getCalendarEvents(schedules, []);
    }

    ngOnDestroy() {}
}
