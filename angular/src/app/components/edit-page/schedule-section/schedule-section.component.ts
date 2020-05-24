import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

import { Subscription } from 'rxjs';

import { ResponseService } from '../../../services/response.service';
import { ScheduleService } from '../../../services/schedule.service';
import { LibrarianService } from '../../../services/librarian.service';
import { HelperService } from '../../../services/helper.service';

import { Schedule } from '../../../models/schedule.model';
import { Period } from '../../../models/period.model';
import { Librarian } from '../../../models/librarian.model';

import { Days } from '../../../constants/days';

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

    schedules: Schedule[];
    showedSchedules: Schedule[] = [];
    librarians: Librarian[];

    schedulesSubscription: Subscription;
    schedulesFetchSubscription: Subscription;
    schedulesAddSubscription: Subscription;
    schedulesEditSubscription: Subscription;
    schedulesDeleteSubscription: Subscription;
    librariansSubscription: Subscription;
    librariansFetchSubscription: Subscription;

    scheduleSelect: number;
    librarianSelect: number;
    scheduleDay: string;
    schedulePeriodId: number;
    scheduleLibrarianId: number;

    newScheduleDay: string;
    newSchedulePeriodId: number;
    newScheduleLibrarianId: number;

    showScheduleAdding = false;

    days = Object.values(Days);

    constructor(
        private scheduleService: ScheduleService,
        private librarianService: LibrarianService
    ) {}

    ngOnInit() {
        this.librariansFetchSubscription = this.librarianService
            .getLibrariansHttp()
            .subscribe();
        this.librariansSubscription = this.librarianService
            .getLibrarians()
            .subscribe(librarians => {
                this.librarians = librarians;
            });
        this.setSchedules();
    }

    setSchedules(): void {
        this.schedulesFetchSubscription = this.scheduleService
            .fetchAllSchedulesHttp()
            .subscribe();
        this.schedulesSubscription = this.scheduleService
            .getSchedules()
            .subscribe(schedules => {
                this.schedules = schedules;
            });
    }

    getSchedule(): Schedule {
        return this.schedules.find(sch => sch.id === this.scheduleSelect);
    }

    getPeriod(periodId): Period {
        return this.periods.find(per => per.id === periodId);
    }

    getLibrarian(librarianId): Librarian {
        return this.librarians.find(lib => lib.id === librarianId);
    }

    setShowedSchedule(): void {
        this.showedSchedules = this.schedules.filter(
            sch => sch.librarian.id === this.librarianSelect
        );
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
            .subscribe(() => {
                this.scheduleResponseHandler();
                this.scheduleDay = null;
                this.schedulePeriodId = null;
                this.scheduleLibrarianId = null;
                this.scheduleSelect = null;
            });
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

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.schedulesSubscription, [
            this.schedulesFetchSubscription,
            this.schedulesAddSubscription,
            this.schedulesEditSubscription,
            this.schedulesDeleteSubscription,
            this.librariansSubscription,
            this.librariansFetchSubscription
        ]);
    }
}
