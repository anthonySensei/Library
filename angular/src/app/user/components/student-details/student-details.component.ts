import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';

import { Subscription } from 'rxjs';

import { Student } from '../../models/student.model';
import { Loan } from '../../../loans/models/loan.model';
import { Order } from '../../models/order.model';

import { LoansService } from '../../../loans/services/loans.service';
import { StudentService } from '../../services/student.service';

@Component({
    selector: 'app-user-details',
    templateUrl: './student-details.component.html',
    styleUrls: ['./student-details.component.sass']
})
export class StudentDetailsComponent implements OnInit, OnDestroy {
    loans: Loan[];
    orders: Order[];

    student: Student;
    studentId: number;

    userSubscription: Subscription;
    userChangedSubscription: Subscription;

    paramsSubscription: Subscription;

    isLoading = false;

    displayedLoanColumns: string[] = [
        'loanTime',
        'returnedTime',
        'bookISBN',
        'librarianEmail',
        'departmentAddress'
    ];

    displayedOrderColumns: string[] = [
        'orderTime',
        'bookISBN',
        'departmentAddress'
    ];

    loansDataSource: MatTableDataSource<Loan>;
    @ViewChild(MatPaginator, { static: true }) loansPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) loansSort: MatSort;

    ordersDataSource: MatTableDataSource<Order>;
    @ViewChild(MatPaginator, { static: true }) ordersPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) ordersSort: MatSort;

    showLabels = true;
    animations = true;
    xAxis = true;
    yAxis = true;
    showYAxisLabel = true;
    showXAxisLabel = true;
    xAxisLabel = 'Date';
    yAxisLabel = 'Quantity of books';
    timeline = true;

    model: string;
    modelValue: string;

    colorScheme = {
        domain: ['#ffaa00']
    };

    view: any[] = [700, 300];

    multi: any;

    constructor(
        private studentService: StudentService,
        private loansService: LoansService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        document.title = 'Student';
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.studentId = +params.id;
                this.studentSubscriptionHandle();
            }
        );
    }

    studentSubscriptionHandle() {
        this.userSubscription = this.studentService
            .getStudentHttp(this.studentId)
            .subscribe();
        this.userChangedSubscription = this.studentService.studentChanged.subscribe(
            student => {
                this.student = student;
                this.loans = this.student.loans || [];
                this.orders = this.student.orders || [];

                this.loansDataSource = new MatTableDataSource(this.loans);
                this.loansDataSource.paginator = this.loansPaginator;
                this.loansDataSource.sort = this.loansSort;

                this.ordersDataSource = new MatTableDataSource(this.orders);
                this.ordersDataSource.paginator = this.loansPaginator;
                this.ordersDataSource.sort = this.loansSort;
                this.setStatisticToChart(this.student.statistic);
                this.isLoading = false;
            }
        );
        this.student = this.studentService.getStudent();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.loansDataSource.filter = filterValue.trim().toLowerCase();

        if (this.loansDataSource.paginator) {
            this.loansDataSource.paginator.firstPage();
        }
    }

    setStatisticToChart(statistic) {
        const seriesArr = [];
        for (const stat of statistic) {
            const item = {
                name: stat.loanTime,
                value: stat.books
            };
            seriesArr.push(item);
        }
        if (seriesArr.length > 0) {
            this.multi = [
                {
                    name: this.student.name,
                    series: seriesArr
                }
            ];
        } else {
            this.xAxisLabel = '';
            this.multi = [
                {
                    name: this.student.name,
                    series: [
                        {
                            name: 'Empty',
                            value: 0
                        }
                    ]
                }
            ];
        }
    }

    onSelect(data): void {}

    onActivate(data): void {}

    onDeactivate(data): void {}

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.userChangedSubscription.unsubscribe();
        this.paramsSubscription.unsubscribe();
    }
}
