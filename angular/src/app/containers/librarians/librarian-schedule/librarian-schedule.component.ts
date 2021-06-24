import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { Schedule } from '../../../models/schedule.model';
import { getCalendarEvents } from '../../../helper/calendar';
import { Select, Store } from '@ngxs/store';
import { LoadSchedules, ScheduleState } from '../../../store/state/schedule.state';
import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { SchedulePopupComponent } from '../../../components/popups/schedule-popup/schedule-popup.component';
import {UserState} from '../../../store/state/user.state';
import {User} from '../../../models/user.model';

@Component({
    selector: 'app-librarian-schedule',
    templateUrl: './librarian-schedule.component.html',
    styleUrls: ['./librarian-schedule.component.scss']
})
export class LibrarianScheduleComponent implements OnInit, OnDestroy {

    actions: CalendarEventAction[] = [];
    events: CalendarEvent[] = [];

    @Select(ScheduleState.Schedules)
    schedules$: Observable<Schedule[]>;

    @Select(UserState.User)
    user$: Observable<User>;

    constructor(
        private store: Store,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.store.dispatch(new LoadSchedules());
        this.getSchedules$();
    }

    getSchedules$() {
        this.schedules$.pipe(untilDestroyed(this)).subscribe(schedule => this.updateCalendar(schedule));
    }

    updateCalendar(schedules: Schedule[]) {
        this.events = getCalendarEvents(schedules, this.actions);
    }

    // onEventEdit(event: CalendarEvent): void {
    //     console.log(event);
    // }
    //
    // onEventDelete(event: CalendarEvent): void {
    //     console.log(event);
    // }

    onOpenCreatePopup() {
        this.dialog.open(SchedulePopupComponent, { disableClose: false, width: '768px' });
    }

    ngOnDestroy(): void {}
}
