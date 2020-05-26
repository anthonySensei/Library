import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Department } from '../../../../models/department.model';

import { LoansDataSource } from '../../../../datasources/loans.datasource';

import { LoansService } from '../../../../services/loans.service';
import { HelperService } from '../../../../services/helper.service';

@Component({
    selector: 'app-loan-section',
    templateUrl: './loan-section.component.html',
    styleUrls: ['./loan-section.component.sass']
})
export class LoanSectionComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() studentId: number;
    @Input() departments: Department[];
    @Input() helperService: HelperService;

    mergeSubscription: Subscription;
    sortSubscription: Subscription;

    columnsToDisplay: string[] = [
        'loanTime',
        'returnedTime',
        'bookISBN',
        'librarianEmail'
    ];

    departmentSelect: number;

    dataSource: LoansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingDebtors: boolean;

    constructor(
        private loansService: LoansService
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
            null,
            this.studentId
        );
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
            null,
            this.studentId
        );
    }

    ngOnDestroy(): void {
        this.mergeSubscription.add(this.sortSubscription);
        this.mergeSubscription.unsubscribe();
    }
}
