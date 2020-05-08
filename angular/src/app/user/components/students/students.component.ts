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

import { Student } from '../../models/student.model';
import { AngularLinks } from '../../../constants/angularLinks';
import { StudentService } from '../../services/student.service';

@Component({
    selector: 'app-users',
    templateUrl: './students.component.html',
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
    studentsChangedSubscription: Subscription;

    columnsToDisplay: string[] = ['name', 'email', 'readerTicket', 'status'];
    expandedElement: Student | null;

    dataSource: MatTableDataSource<Student>;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(private studentService: StudentService) {}

    ngOnInit() {
        document.title = 'Students';
        this.subscriptionsHandle();
    }

    subscriptionsHandle() {
        this.studentsSubscription = this.studentService
            .getStudentsHttp()
            .subscribe();
        this.studentsChangedSubscription = this.studentService.studentsChanged.subscribe(
            students => {
                this.students = students;
                this.dataSource = new MatTableDataSource(this.students);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            }
        );
        this.students = this.studentService.getStudents();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    ngOnDestroy(): void {
        this.studentsSubscription.unsubscribe();
        this.studentsChangedSubscription.unsubscribe();
    }
}
