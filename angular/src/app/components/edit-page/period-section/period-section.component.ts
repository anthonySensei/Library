import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output
} from '@angular/core';

import { Subscription } from 'rxjs';

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
export class PeriodSectionComponent implements OnDestroy {
    @Output() openSnackbar = new EventEmitter();
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() periods: Period[];

    periodsSubscription: Subscription;
    periodsFetchSubscription: Subscription;
    periodsAddSubscription: Subscription;
    periodsEditSubscription: Subscription;
    periodsDeleteSubscription: Subscription;

    periodSelect: number;
    periodStart: string;
    periodEnd: string;

    newPeriodStart: string;
    newPeriodEnd: string;

    showPeriodAdding = false;

    response: Response;

    constructor(private periodService: PeriodService) {}

    getPeriod(): Period {
        return this.periods.find(per => per.id === this.periodSelect);
    }

    setPeriod(): void {
        if (this.periodSelect) {
            this.periodStart = this.getPeriod().start;
            this.periodEnd = this.getPeriod().end;
        }
    }

    addPeriod(): void {
        this.periodsAddSubscription = this.periodService
            .addPeriodsHttp({
                id: null,
                start: this.newPeriodStart,
                end: this.newPeriodEnd
            })
            .subscribe(() => {
                this.periodResponseHandler();
            });
    }

    editPeriod(): void {
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
        this.periodsEditSubscription = this.periodService
            .ediPeriodsHttp({
                id: this.periodSelect,
                start: this.periodStart,
                end: this.periodEnd
            })
            .subscribe(() => {
                this.periodResponseHandler();
            });
    }

    deletePeriod(): void {
        if (!this.periodSelect) {
            return;
        }
        this.periodsDeleteSubscription = this.periodService
            .deletePeriodsHttp(this.periodSelect)
            .subscribe(() => {
                this.periodResponseHandler();
            });
    }

    periodResponseHandler(): void {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.periodsFetchSubscription = this.periodService
                .fetchAllPeriodsHttp()
                .subscribe();
            this.periodsSubscription = this.periodService
                .getPeriods()
                .subscribe((periods: Period[]) => {
                    this.periods = periods;
                });
            this.newPeriodEnd = null;
            this.newPeriodStart = null;
            this.periodStart = null;
            this.periodEnd = null;
            this.periodSelect = null;
        } else {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    ngOnDestroy(): void {
        if (this.periodsSubscription) {
            this.periodsSubscription.add(this.periodsFetchSubscription);
            this.periodsSubscription.add(this.periodsAddSubscription);
            this.periodsSubscription.add(this.periodsEditSubscription);
            this.periodsSubscription.add(this.periodsDeleteSubscription);
            this.periodsSubscription.unsubscribe();
        }
    }
}
