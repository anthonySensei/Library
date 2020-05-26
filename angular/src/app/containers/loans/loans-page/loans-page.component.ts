import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

import { merge, Subscription } from 'rxjs';

import { LoansService } from '../../../services/loans.service';
import { ResponseService } from '../../../services/response.service';
import { DepartmentService } from '../../../services/department.service';
import { StudentService } from '../../../services/student.service';

import { Loan } from '../../../models/loan.model';
import { Department } from '../../../models/department.model';
import { Student } from '../../../models/student.model';
import { HelperService } from '../../../services/helper.service';
import { LoansDataSource } from '../../../datasources/loans.datasource';
import { LibrariansDataSource } from '../../../datasources/librarians.datasource';
import { tap } from 'rxjs/operators';

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
export class LoansPageComponent implements OnInit, AfterViewInit, OnDestroy {
    departments: Department[];

    mergeSubscription: Subscription;
    sortSubscription: Subscription;
    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    returnBookSubscription: Subscription;

    columnsToDisplay: string[] = [
        'loanTime',
        'returnedTime',
        'bookISBN',
        'studentReaderTicket',
        'librarianEmail'
    ];
    expandedElement: Loan | null;

    filterName: string;
    filterValue: string;
    departmentSelect: number;
    date: Date = null;

    dataSource: LoansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingDebtors: boolean;

    constructor(
        private loansService: LoansService,
        private departmentService: DepartmentService,
        private helperService: HelperService,
        private responseService: ResponseService
    ) {}

    ngOnInit(): void {
        document.title = 'Loans';
        this.dataSource = new LoansDataSource(this.loansService);
        this.dataSource.loadLoans('', '', 'desc', 0, 5, null, null, false);
        this.subscriptionsHandle();
    }

    ngAfterViewInit(): void {
        this.sortSubscription = this.sort.sortChange.subscribe(
            () => (this.paginator.pageIndex = 0)
        );

        this.mergeSubscription = merge(
            this.sort.sortChange,
            this.paginator.page
        )
            .pipe(tap(() => this.loadLoansPage()))
            .subscribe();
    }

    subscriptionsHandle(): void {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
            });
    }

    returnBook(loanId: any, bookId: any): void {
        this.returnBookSubscription = this.loansService
            .returnBookHttp(loanId, bookId, new Date())
            .subscribe(() => {
                if (this.responseService.responseHandle()) {
                    this.loadLoansPage();
                }
            });
    }

    loadLoansPage(): void {
        if (!this.filterName) {
            this.filterValue = '';
        }
        this.dataSource.loadLoans(
            this.filterName,
            this.filterValue,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.departmentSelect,
            this.date,
            this.isShowingDebtors
        );
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.departmentsSubscription, [
            this.departmentsFetchSubscription,
            this.mergeSubscription,
            this.sortSubscription,
            this.returnBookSubscription
        ]);
    }
}
