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
        this.scheduleService.fetchAllSchedulesHttp().pipe(untilDestroyed(this)).subscribe();
        this.scheduleService.getSchedules().pipe(untilDestroyed(this)).subscribe(schedules => {
            this.schedules = schedules;
        });
    }

    getSchedule(): Schedule {
        return this.schedules.find((sch: Schedule) => sch.id === this.scheduleSelect);
    }

    setShowedSchedule(): void {
        this.showedSchedules = this.schedules.filter((sch: Schedule) => sch.librarian.id === this.librarianSelect);
    }

    setSchedule(): void {
        if (this.scheduleSelect) {
            this.scheduleDay = this.getSchedule().day;
            this.scheduleLibrarianId = this.getSchedule().librarian.id;
        }
    }

    addSchedule(): void {
        this.scheduleService
            .addScheduleHttp({
                id: null,
                day: this.newScheduleDay,
                librarian: {}
            })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
            });
    }

    editSchedule(): void {
        if (
            !this.scheduleDay ||
            !this.scheduleLibrarianId
        ) {
            return;
        }
        if (
            this.scheduleDay === this.getSchedule().day &&
            this.scheduleLibrarianId === this.getSchedule().librarian.id
        ) {
            this.nothingToChange.emit();
            return;
        }
        this.scheduleService
            .ediScheduleHttp({
                id: this.scheduleSelect,
                day: this.scheduleDay,
                librarian: {}
            })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
            });
    }

    deleteSchedule(): void {
        if (!this.scheduleSelect) {
            return;
        }
        this.scheduleService
            .deleteScheduleHttp(this.scheduleSelect)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.scheduleDay = null;
                this.scheduleLibrarianId = null;
                this.scheduleSelect = null;
            });
    }

    openConfirmDeleteDialog(): void {}

    ngOnDestroy(): void {}
}
