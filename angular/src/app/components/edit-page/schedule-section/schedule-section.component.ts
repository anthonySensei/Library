import { Component, OnDestroy, OnInit } from '@angular/core';

import { Schedule } from '../../../models/schedule.model';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DeleteSchedule, ScheduleState } from '../../../store/state/schedule.state';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { SchedulePopupComponent } from '../../popups/schedule-popup/schedule-popup.component';

@Component({
    selector: 'app-schedule-section',
    templateUrl: './schedule-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class ScheduleSectionComponent implements OnInit, OnDestroy {

    schedules: Schedule[];
    displayedColumns: string[] = ['librarian', 'start', 'end', 'weekDays', 'actions'];

    @Select(ScheduleState.Schedules)
    schedules$: Observable<Schedule[]>;

    constructor(
        private store: Store,
        private dialog: MatDialog
    ) {}

    ngOnInit() {}

    getTime(time: Date): string {
        return moment(time).format('HH:mm');
    }

    getDays(weekDays: string[]): string {
        return weekDays.join(', ');
    }

    onAddSchedule() {
        this.dialog.open(SchedulePopupComponent, { disableClose: true, width: '768px' });
    }

    onEditSchedule(schedule: Schedule) {
        this.dialog.open(SchedulePopupComponent, { data: schedule, disableClose: true, width: '768px' });
    }

    onDeleteSchedule(id: string) {
        this.store.dispatch(new DeleteSchedule(id));
    }

    ngOnDestroy(): void {}
}
