import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Student } from '../../models/student.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Loan } from '../../../loans/models/loan.model';
import { LoansService } from '../../../loans/services/loans.service';
import { StudentService } from '../../services/student.service';

@Component({
    selector: 'app-user-details',
    templateUrl: './student-details.component.html',
    styleUrls: ['./student-details.component.sass']
})
export class StudentDetailsComponent implements OnInit, OnDestroy {
    loans: Loan[];

    loansSubscription: Subscription;
    loansChangedSubscription: Subscription;

    student: Student;
    studentId: number;

    userSubscription: Subscription;
    userChangedSubscription: Subscription;

    paramsSubscription: Subscription;

    isLoading = false;

    displayedColumns: string[] = [
        'loanTime',
        'returnedTime',
        'bookISBN',
        'librarianEmail',
        'departmentAddress'
    ];

    dataSource: MatTableDataSource<Loan>;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        private studentService: StudentService,
        private loansService: LoansService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        document.title = 'Library';
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.studentId = +params.id;
                this.loanSubscriptionHandle();
            }
        );
        this.studentSubscriptionHandle();
    }

    studentSubscriptionHandle() {
        this.userSubscription = this.studentService
            .getStudentHttp(this.studentId)
            .subscribe();
        this.userChangedSubscription = this.studentService.studentChanged.subscribe(
            student => {
                this.student = student;
                this.isLoading = false;
            }
        );
        this.student = this.studentService.getStudent();
    }

    loanSubscriptionHandle() {
        this.loansSubscription = this.loansService
            .fetchStudentLoansHttp(this.studentId)
            .subscribe();
        this.loansChangedSubscription = this.loansService.loansChanged.subscribe(
            loans => {
                this.loans = loans;
                this.dataSource = new MatTableDataSource(this.loans);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            }
        );
        this.loans = this.loansService.getLoans();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.userChangedSubscription.unsubscribe();
        this.loansSubscription.unsubscribe();
        this.loansChangedSubscription.unsubscribe();
        this.paramsSubscription.unsubscribe();
    }
}
