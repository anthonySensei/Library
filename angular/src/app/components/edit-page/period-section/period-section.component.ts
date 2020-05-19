import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

import { SnackBarClasses } from '../../../constants/snackBarClasses';

import { ResponseService } from '../../../services/response.service';
import { PeriodService } from '../../../services/period.service';

import { Period } from '../../../models/period.model';
import { Response } from '../../../models/response.model';

@Component({
    selector: 'app-period-section',
    templateUrl: './period-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class PeriodSectionComponent implements OnInit, OnDestroy {
    @Output() openSnackbar = new EventEmitter();
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() periods: Period[];

    periodSelect = null;
    periodStart = null;
    periodEnd = null;

    newPeriodStart = null;
    newPeriodEnd = null;

    showPeriodAdding = false;

    response: Response;

    constructor(private periodService: PeriodService) {}

    ngOnInit() {}

    getPeriod(): Period {
        return this.periods.find(per => per.id === this.periodSelect);
    }

    setPeriod() {
        if (this.periodSelect) {
            this.periodStart = this.getPeriod().start;
            this.periodEnd = this.getPeriod().end;
        }
    }

    addPeriod() {
        this.periodService
            .addPeriodsHttp({
                id: null,
                start: this.newPeriodStart,
                end: this.newPeriodEnd
            })
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                this.periodResponseHandler();
            });
    }

    editPeriod() {
        if (!this.periodStart || !this.periodEnd) {
            return;
        }
        if (
            this.periodStart === this.getPeriod().start &&
            this.periodEnd === this.getPeriod().end
        ) {
            this.nothingToChange.emit();
            return;
        }
        this.periodService
            .ediPeriodsHttp({
                id: this.periodSelect,
                start: this.periodStart,
                end: this.periodEnd
            })
            .subscribe(() => {
                this.periodResponseHandler();
            });
    }

    deletePeriod() {
        if (!this.periodSelect) {
            return;
        }
        this.periodService
            .deletePeriodsHttp(this.periodSelect)
            .subscribe(() => {
                this.periodResponseHandler();
                this.periodStart = null;
                this.periodEnd = null;
                this.periodSelect = null;
            });
    }

    periodResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.periodService.fetchAllPeriodsHttp().subscribe();
            this.periods = this.periodService.getPeriods();
            this.newPeriodEnd = null;
            this.newPeriodStart = null;
        } else {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    ngOnDestroy(): void {}
}
