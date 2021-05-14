import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { ScheduleService } from '../../../services/schedule.service';

import { Schedule } from '../../../models/schedule.model';
import { Period } from '../../../models/period.model';

import { Days } from '../../../constants/days';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-schedule-section',
    templateUrl: './schedule-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class ScheduleSectionComponent implements OnInit, OnDestroy {
    @Output() nothingToChange = new EventEmitter();

    @Input() periods: Period[];

    schedules: Schedule[];
    showedSchedules: Schedule[] = [];

    scheduleSelect: number;
    librarianSelect: string;
    scheduleDay: string;
    schedulePeriodId: number;
    scheduleLibrarianId: string;

    newScheduleDay: string;
    newSchedulePeriodId: number;
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

    getPeriod(periodId): Period {
        return this.periods.find((per: Period) => per.id === periodId);
    }

    setShowedSchedule(): void {
        this.showedSchedules = this.schedules.filter((sch: Schedule) => sch.librarian.id === this.librarianSelect);
    }

    setSchedule(): void {
        if (this.scheduleSelect) {
            this.scheduleDay = this.getSchedule().day;
            this.schedulePeriodId = this.getSchedule().period.id;
            this.scheduleLibrarianId = this.getSchedule().librarian.id;
        }
    }

    addSchedule(): void {
        this.scheduleService
            .addScheduleHttp({
                id: null,
                day: this.newScheduleDay,
                period: this.getPeriod(this.newSchedulePeriodId),
                librarian: {}
            })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
            });
    }

    editSchedule(): void {
        if (
            !this.scheduleDay ||
            !this.scheduleLibrarianId ||
            !this.schedulePeriodId
        ) {
            return;
        }
        if (
            this.scheduleDay === this.getSchedule().day &&
            this.schedulePeriodId === this.getSchedule().period.id &&
            this.scheduleLibrarianId === this.getSchedule().librarian.id
        ) {
            this.nothingToChange.emit();
            return;
        }
        this.scheduleService
            .ediScheduleHttp({
                id: this.scheduleSelect,
                day: this.scheduleDay,
                period: this.getPeriod(this.schedulePeriodId),
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
                this.schedulePeriodId = null;
                this.scheduleLibrarianId = null;
                this.scheduleSelect = null;
            });
    }

    openConfirmDeleteDialog(): void {}

    ngOnDestroy(): void {}
}
