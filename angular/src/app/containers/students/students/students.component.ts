import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';

import { Student } from '../../../models/student.model';

import { AngularLinks } from '../../../constants/angularLinks';
import { TableColumns } from '../../../constants/tableColumns';
import { PageTitles } from '../../../constants/pageTitles';
import { SortOrder } from '../../../constants/sortOrder';

import { StudentService } from '../../../services/student.service';
import { HelperService } from '../../../services/helper.service';

import { StudentsDataSource } from '../../../datasources/students.datasource';
import { TABLE_ANIMATION } from '../../../constants/animation';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-users',
    templateUrl: './students.component.html',
    animations: TABLE_ANIMATION
})
export class StudentsComponent implements OnInit, AfterViewInit, OnDestroy {
    students: Student[];

    links = AngularLinks;

    columnsToDisplay: string[] = [
        TableColumns.NAME,
        TableColumns.EMAIL,
        TableColumns.READER_TICKET,
        TableColumns.STATUS
    ];
    expandedElement: Student | null;

    filterName: string;
    filterValue: string;

    dataSource: StudentsDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        private studentService: StudentService,
        public helperService: HelperService
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.STUDENTS;
        this.dataSource = new StudentsDataSource(this.studentService);
        this.dataSource.loadStudents('', '', SortOrder.ASC, 0, 5);
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.pipe(untilDestroyed(this)).subscribe(() => (this.paginator.pageIndex = 0));
        merge(this.sort.sortChange, this.paginator.page).pipe(tap(() => this.loadStudentsPage())).pipe(untilDestroyed(this)).subscribe();
    }

    loadStudentsPage(): void {
        if (!this.filterName) {
            this.filterValue = '';
        }
        this.dataSource.loadStudents(
            this.filterName,
            this.filterValue,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );
    }

    ngOnDestroy(): void {}
}
