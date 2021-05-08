import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

import { Subscription } from 'rxjs';

import { Department } from '../../../../models/department.model';
import { Librarian } from '../../../../models/librarian.model';

import { LibrarianService } from '../../../../services/librarian.service';
import { DepartmentService } from '../../../../services/department.service';
import { HelperService } from '../../../../services/helper.service';

@Component({
    selector: 'app-schedule-filter-section',
    templateUrl: './schedule-filter-section.component.html',
    styleUrls: ['../librarian-schedule.component.scss']
})
export class ScheduleFilterSectionComponent implements OnInit, OnDestroy {
    @Input() departmentSelect: number;
    @Input() librarianSelect: number;
    @Input() helperService: HelperService;

    @Output() departmentSelectChange: EventEmitter<number> = new EventEmitter<
        number
    >();
    @Output() librarianSelectChange: EventEmitter<number> = new EventEmitter<
        number
    >();
    @Output() setSchedules = new EventEmitter();

    departments: Department[];
    librarians: Librarian[];

    librariansSubscription: Subscription;
    librariansFetchSubscription: Subscription;
    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;

    constructor(
        private librarianService: LibrarianService,
        private departmentService: DepartmentService
    ) {}

    ngOnInit() {
        this.subscriptionHandle();
    }

    subscriptionHandle() {
        this.departmentsFetchSubscription = this.departmentService
            .getDepartments()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
            });
    }

    onSetSchedules() {
        this.departmentSelectChange.emit(this.departmentSelect);
        this.librarianSelectChange.emit(this.librarianSelect);
        this.setSchedules.emit();
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.departmentsSubscription, [
            this.departmentsFetchSubscription,
            this.librariansSubscription,
            this.librariansFetchSubscription
        ]);
    }
}
