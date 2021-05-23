import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { ScheduleService } from '../../../services/schedule.service';

import { Schedule } from '../../../models/schedule.model';

import { Days } from '../../../constants/days';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-schedule-section',
    templateUrl: './schedule-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class ScheduleSectionComponent implements OnInit, OnDestroy {
    @Output() nothingToChange = new EventEmitter();

    schedules: Schedule[];
    showedSchedules: Schedule[] = [];

    scheduleSelect: number;
    librarianSelect: string;
    scheduleDay: string;
    scheduleLibrarianId: string;

    newScheduleDay: string;
    newScheduleLibrarianId: number;

    showScheduleAdding = false;

    days = Object.values(Days);

    constructor(
        private scheduleService: ScheduleService,
    ) {
    }

    ngOnInit() {
        this.setSchedules();
    }

    setSchedules(): void {
    }

    getSchedule(): any {
        return {};
    }

    setSchedule(): void {
        if (this.scheduleSelect) {
        }
    }

    addSchedule(): void {}

    editSchedule(): void {}

    deleteSchedule(): void {}

    openConfirmDeleteDialog(): void {}

    ngOnDestroy(): void {}
}
