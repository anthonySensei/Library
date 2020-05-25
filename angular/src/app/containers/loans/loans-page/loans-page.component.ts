import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

import { Subscription } from 'rxjs';

import { LoansService } from '../../../services/loans.service';
import { ResponseService } from '../../../services/response.service';
import { DepartmentService } from '../../../services/department.service';
import { StudentService } from '../../../services/student.service';

import { Loan } from '../../../models/loan.model';
import { Department } from '../../../models/department.model';
import { Student } from '../../../models/student.model';

@Component({
    selector: 'app-loan-page',
    templateUrl: './loans-page.component.html',
    styleUrls: ['./loans-page.component.sass'],
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
export class LoansPageComponent implements OnInit, OnDestroy {
    loans: Loan[];
    departments: Department[];
    students: Student[];

    studentSelect;
    departmentSelect;
    date: Date = null;

    loansSubscription: Subscription;
    loansFetchSubscription: Subscription;
    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    studentsSubscription: Subscription;
    studentsFetchSubscription: Subscription;
    returnBookSubscription: Subscription;

    columnsToDisplay: string[] = [
        'loanTime',
        'returnedTime',
        'bookISBN',
        'studentReaderTicket',
        'librarianEmail'
    ];
    expandedElement: Loan | null;

    dataSource: MatTableDataSource<Loan>;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingDebtors: boolean;

    constructor(
        private loansService: LoansService,
        private departmentService: DepartmentService,
        private studentService: StudentService,
        private responseService: ResponseService
    ) {}

    ngOnInit(): void {
        document.title = 'Loans';
        this.subscriptionsHandle();
    }

    setLoans(): void {
        this.loansFetchSubscription = this.loansService
            .fetchLoansHttp(
                this.departmentSelect,
                this.studentSelect,
                this.date
            )
            .subscribe();
        this.loansSubscription = this.loansService
            .getLoans()
            .subscribe((loans: Loan[]) => {
                this.loans = loans;
                this.dataSource = new MatTableDataSource(this.loans);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            });
    }

    subscriptionsHandle(): void {
        this.setLoans();
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
            });
        this.studentsFetchSubscription = this.studentService
            .getStudentsHttp()
            .subscribe();
        this.studentsSubscription = this.studentService
            .getStudents()
            .subscribe((students: Student[]) => {
                this.students = students;
            });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    returnBook(loanId: any, bookId: any): void {
        this.returnBookSubscription = this.loansService
            .returnBookHttp(loanId, bookId, new Date())
            .subscribe(() => {
                if (this.responseService.responseHandle()) {
                    this.setLoans();
                }
            });
    }

    showDebtors(): void {
        this.isShowingDebtors = !this.isShowingDebtors;
    }

    ngOnDestroy(): void {
        this.loansFetchSubscription.unsubscribe();
        this.loansSubscription.unsubscribe();
    }
}
