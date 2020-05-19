import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import { ResponseService } from '../../../services/response.service';
import { Subscription } from 'rxjs';
import { Response } from '../../../models/response.model';
import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { Schedule } from '../../../models/schedule.model';
import { ScheduleService } from '../../../services/schedule.service';
import { Period } from '../../../models/period.model';
import { Librarian } from '../../../models/librarian.model';

@Component({
    selector: 'app-schedule-section',
    templateUrl: './schedule-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class ScheduleSectionComponent implements OnInit, OnDestroy {
    @Output() onOpenSnackbar = new EventEmitter();
    @Output() onNothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() periods: Period[];

    schedules: Schedule[];
    librarians: Librarian[];

    schedulesFetchSubscription: Subscription;
    schedulesChangeSubscription: Subscription;

    scheduleSelect = null;
    scheduleDay = null;
    schedulePeriodId = null;
    scheduleLibrarianId = null;

    newScheduleDay = null;
    newSchedulePeriodId = null;
    newScheduleLibrarianId = null;

    showScheduleAdding = false;

    response: Response;

    constructor(private schedule: ScheduleService) {}

    ngOnInit() {
        this.schedulesFetchSubscription = this.schedule
            .fetchAllSchedulesHttp()
            .subscribe();
        this.schedulesChangeSubscription = this.schedule.schedulesChanged.subscribe(
            schedules => {
                this.schedules = schedules;
            }
        );
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

    setSchedule() {
        if (this.scheduleSelect) {
            this.scheduleDay = this.getSchedule().day;
            this.schedulePeriodId = this.getSchedule().period.id;
            this.scheduleLibrarianId = this.getSchedule().librarian.id;
        }
    }

    addSchedule() {
        this.schedule
            .addScheduleHttp({
                id: null,
                day: this.newScheduleDay,
                period: this.getPeriod(this.newSchedulePeriodId),
                librarian: this.getLibrarian(this.newScheduleLibrarianId)
            })
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                this.scheduleResponseHandler();
            });
    }

    editSchedule() {
        if (!this.scheduleDay) {
            return;
        }
        if (
            this.newScheduleDay === this.getSchedule().day &&
            this.newSchedulePeriodId === this.getSchedule().period.id &&
            this.newScheduleLibrarianId === this.getSchedule().librarian.id
        ) {
            this.onNothingToChange.emit();
            return;
        }
        this.schedule
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

    deleteSchedule() {
        if (!this.scheduleSelect) {
            return;
        }
        this.schedule.deleteScheduleHttp(this.scheduleSelect).subscribe(() => {
            this.scheduleResponseHandler();
            this.scheduleDay = null;
            this.schedulePeriodId = null;
            this.scheduleLibrarianId = null;
            this.scheduleSelect = null;
        });
    }

    scheduleResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.schedule.fetchAllSchedulesHttp().subscribe();
            this.schedules = this.schedule.getSchedules();
            this.schedulePeriodId = null;
        } else {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    ngOnDestroy(): void {
        this.schedulesFetchSubscription.unsubscribe();
        this.schedulesChangeSubscription.unsubscribe();
    }
}
