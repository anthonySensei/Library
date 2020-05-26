import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

import { merge, Subscription } from 'rxjs';

import { Student } from '../../../models/student.model';

import { AngularLinks } from '../../../constants/angularLinks';

import { StudentService } from '../../../services/student.service';
import { StudentsDataSource } from '../../../datasources/students.datasource';
import { LibrariansDataSource } from '../../../datasources/librarians.datasource';
import { tap } from 'rxjs/operators';
import { HelperService } from '../../../services/helper.service';

@Component({
    selector: 'app-users',
    templateUrl: './students.component.html',
    styleUrls: ['../../../app.component.sass'],

    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition(
                'expanded <=> collapsed',
                animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
            )
        ])
    ]
})
export class StudentsComponent implements OnInit, AfterViewInit, OnDestroy {
    students: Student[];

    links = AngularLinks;

    columnsToDisplay: string[] = ['name', 'email', 'readerTicket', 'status'];
    expandedElement: Student | null;

    mergeSubscription: Subscription;
    sortSubscription: Subscription;

    filterName: string;
    filterValue: string;

    dataSource: StudentsDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        private studentService: StudentService,
        private helperService: HelperService
    ) {}

    ngOnInit(): void {
        document.title = 'Students';
        this.dataSource = new StudentsDataSource(this.studentService);
        this.dataSource.loadStudents('', '', 'asc', 0, 5);
    }

    ngAfterViewInit(): void {
        this.sortSubscription = this.sort.sortChange.subscribe(
            () => (this.paginator.pageIndex = 0)
        );

        this.mergeSubscription = merge(
            this.sort.sortChange,
            this.paginator.page
        )
            .pipe(tap(() => this.loadStudentsPage()))
            .subscribe();
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

    ngOnDestroy(): void {
        this.sortSubscription.unsubscribe();
        this.mergeSubscription.unsubscribe();
    }
}
