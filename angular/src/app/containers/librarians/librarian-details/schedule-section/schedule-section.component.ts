import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Schedule } from '../../../../models/schedule.model';

@Component({
    selector: 'app-schedule-section',
    templateUrl: './schedule-section.component.html'
})
export class ScheduleSectionComponent implements OnInit {
    @Input() schedule: Schedule[];
    displayedScheduleColumns: string[] = ['day', 'start', 'end'];

    scheduleDataSource: MatTableDataSource<{}>;
    @ViewChild(MatSort, { static: true }) scheduleSort: MatSort;
    constructor() {}

    ngOnInit(): void {
        this.scheduleDataSource = new MatTableDataSource(this.schedule);
        this.scheduleDataSource.sort = this.scheduleSort;
    }
}
