import {
    AfterViewInit,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { HelperService } from '../../../../services/helper.service';
import { LoansService } from '../../../../services/loans.service';

import { LoansDataSource } from '../../../../datasources/loans.datasource';

import { Department } from '../../../../models/department.model';
import { DepartmentService } from '../../../../services/department.service';

@Component({
    selector: 'app-loans-section',
    templateUrl: './loans-section.component.html'
})
export class LoansSectionComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() librarianId: number;
    @Input() helperService: HelperService;
    departments: Department[];

    mergeSubscription: Subscription;
    sortSubscription: Subscription;
    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;

    columnsToDisplay: string[] = [
        'loanTime',
        'returnedTime',
        'bookISBN',
        'studentTicketReader'
    ];

    departmentSelect: number;

    dataSource: LoansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingDebtors: boolean;

    constructor(
        private loansService: LoansService,
        private departmentService: DepartmentService
    ) {}

    ngOnInit(): void {
        this.dataSource = new LoansDataSource(this.loansService);
        this.dataSource.loadLoans(
            '',
            '',
            'desc',
            0,
            5,
            null,
            null,
            false,
            this.librarianId,
            null
        );
        this.subscriptionHandle();
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

    subscriptionHandle() {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
            });
    }

    loadLoansPage(): void {
        this.dataSource.loadLoans(
            null,
            null,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.departmentSelect,
            null,
            this.isShowingDebtors,
            this.librarianId,
            null
        );
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.mergeSubscription, [
            this.sortSubscription,
            this.departmentsFetchSubscription,
            this.departmentsSubscription
        ]);
    }
}
