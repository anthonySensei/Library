import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { ResponseService } from '../../../services/response.service';
import { ScheduleService } from '../../../services/schedule.service';
import { HelperService } from '../../../services/helper.service';

import { Schedule } from '../../../models/schedule.model';
import { Period } from '../../../models/period.model';
import { Librarian } from '../../../models/librarian.model';

import { Days } from '../../../constants/days';
import { MatDialog } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-schedule-section',
    templateUrl: './schedule-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class ScheduleSectionComponent implements OnInit, OnDestroy {
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() helperService: HelperService;
    @Input() periods: Period[];
    @Input() librarians: Librarian[];

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
        private dialog: MatDialog
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

    getLibrarian(librarianId): Librarian {
        return this.librarians.find((lib: Librarian) => lib.id === librarianId);
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
                librarian: this.getLibrarian(this.newScheduleLibrarianId)
            })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.scheduleResponseHandler();
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
                librarian: this.getLibrarian(this.scheduleLibrarianId)
            })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.scheduleResponseHandler();
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
                this.scheduleResponseHandler();
                this.scheduleDay = null;
                this.schedulePeriodId = null;
                this.scheduleLibrarianId = null;
                this.scheduleSelect = null;
            });
    }

    openConfirmDeleteDialog(): void {
        // const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
        //     width: ModalWidth.W30P
        // });
        //
        // dialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         this.deleteSchedule();
        //     }
        // });
    }

    scheduleResponseHandler(): void {
        if (this.responseService.responseHandle()) {
            this.setSchedules();
            this.setShowedSchedule();
            this.newScheduleDay = null;
            this.newSchedulePeriodId = null;
            this.newScheduleLibrarianId = null;
        }
    }

    ngOnDestroy(): void {}
}
