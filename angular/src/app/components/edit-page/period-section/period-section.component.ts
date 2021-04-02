import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output
} from '@angular/core';

import { Subscription } from 'rxjs';

import { ResponseService } from '../../../services/response.service';
import { PeriodService } from '../../../services/period.service';
import { HelperService } from '../../../services/helper.service';

import { Period } from '../../../models/period.model';
import { MatDialog } from '@angular/material';
import { ModalWidth } from '../../../constants/modalWidth';

@Component({
    selector: 'app-period-section',
    templateUrl: './period-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class PeriodSectionComponent implements OnDestroy {
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() helperService: HelperService;
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

    constructor(
        private periodService: PeriodService,
        private dialog: MatDialog
    ) {}

    getPeriod(): Period {
        return this.periods.find((per: Period) => per.id === this.periodSelect);
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

    openConfirmDeleteDialog(): void {
        // const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
        //     width: ModalWidth.W30P
        // });
        //
        // dialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         this.deletePeriod();
        //     }
        // });
    }

    periodResponseHandler(): void {
        if (this.responseService.responseHandle()) {
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
        }
    }

    ngOnDestroy(): void {
        if (this.periodsSubscription) {
            this.helperService.unsubscribeHandle(this.periodsSubscription, [
                this.periodsFetchSubscription,
                this.periodsAddSubscription,
                this.periodsEditSubscription,
                this.periodsDeleteSubscription
            ]);
        }
    }
}
