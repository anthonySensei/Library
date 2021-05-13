import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Department } from '../../../../models/department.model';
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

    constructor() {}

    ngOnInit() {}

    onSetSchedules() {
        this.departmentSelectChange.emit(this.departmentSelect);
        this.librarianSelectChange.emit(this.librarianSelect);
        this.setSchedules.emit();
    }

    ngOnDestroy(): void {}
}
