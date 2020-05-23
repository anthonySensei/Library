import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

import { Subscription } from 'rxjs';

import { Student } from '../../../models/student.model';

import { AngularLinks } from '../../../constants/angularLinks';

import { StudentService } from '../../../services/student.service';

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
export class StudentsComponent implements OnInit, OnDestroy {
    students: Student[];

    links = AngularLinks;

    studentsSubscription: Subscription;
    studentsFetchSubscription: Subscription;

    columnsToDisplay: string[] = ['name', 'email', 'readerTicket', 'status'];
    expandedElement: Student | null;

    dataSource: MatTableDataSource<Student>;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(private studentService: StudentService) {}

    ngOnInit(): void {
        document.title = 'Students';
        this.subscriptionsHandle();
    }

    subscriptionsHandle(): void {
        this.studentsFetchSubscription = this.studentService
            .getStudentsHttp()
            .subscribe();
        this.studentsSubscription = this.studentService.getStudents().subscribe(
            (students: Student[]) => {
                this.students = students;
                this.dataSource = new MatTableDataSource(this.students);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            }
        );
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    ngOnDestroy(): void {
        this.studentsSubscription.add(this.studentsFetchSubscription);
        this.studentsSubscription.unsubscribe();
    }
}
