import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-schedule-filter-section',
    templateUrl: './schedule-filter-section.component.html',
    styleUrls: ['../librarian-schedule.component.scss']
})
export class ScheduleFilterSectionComponent implements OnInit, OnDestroy {
    @Input() librarianSelect: number;

    @Output() librarianSelectChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() setSchedules = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    onSetSchedules() {
        this.librarianSelectChange.emit(this.librarianSelect);
        this.setSchedules.emit();
    }

    ngOnDestroy(): void {}
}
