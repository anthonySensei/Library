import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Department } from '../../../../models/department.model';

@Component({
    selector: 'app-schedule-filter-section',
    templateUrl: './schedule-filter-section.component.html',
    styleUrls: ['../librarian-schedule.component.scss']
})
export class ScheduleFilterSectionComponent implements OnInit, OnDestroy {
    @Input() departmentSelect: number;
    @Input() librarianSelect: number;

    @Output() departmentSelectChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() librarianSelectChange: EventEmitter<number> = new EventEmitter<number>();
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
