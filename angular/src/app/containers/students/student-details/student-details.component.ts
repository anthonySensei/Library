import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';

import { Subscription } from 'rxjs';

import { Loan } from '../../../models/loan.model';
import { Order } from '../../../models/order.model';
import { Student } from '../../../models/student.model';

import { StudentService } from '../../../services/student.service';
import { LoansService } from '../../../services/loans.service';
import { HelperService } from '../../../services/helper.service';

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

    studentFetchSubscription: Subscription;
    studentSubscription: Subscription;

    paramsSubscription: Subscription;

    isLoading: boolean;

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
        private helperService: HelperService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        document.title = 'Student';
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.studentId = +params.id;
                this.studentSubscriptionHandle();
            }
        );
    }

    studentSubscriptionHandle(): void {
        this.studentFetchSubscription = this.studentService
            .getStudentHttp(this.studentId)
            .subscribe();
        this.studentSubscription = this.studentService
            .getStudent()
            .subscribe((student: Student) => {
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
            });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.loansDataSource.filter = filterValue.trim().toLowerCase();

        if (this.loansDataSource.paginator) {
            this.loansDataSource.paginator.firstPage();
        }
    }

    setStatisticToChart(statistic): void {
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
        this.helperService.unsubscribeHandle(this.studentSubscription, [
            this.studentFetchSubscription,
            this.paramsSubscription
        ]);
    }
}
