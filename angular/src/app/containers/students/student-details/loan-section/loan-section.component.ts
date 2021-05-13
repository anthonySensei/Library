import {
    AfterViewInit,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Department } from '../../../../models/department.model';

import { LoansDataSource } from '../../../../datasources/loans.datasource';

import { LoansService } from '../../../../services/loans.service';
import { HelperService } from '../../../../services/helper.service';

import { TableColumns } from '../../../../constants/tableColumns';
import { SortOrder } from '../../../../constants/sortOrder';
import { Store } from '@ngxs/store';

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
        TableColumns.LOAN_TIME,
        TableColumns.RETURNED_TIME,
        TableColumns.BOOK_ISBN,
        TableColumns.EMAIL
    ];
    tableColumns = TableColumns;

    departmentSelect: number;

    dataSource: LoansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingDebtors: boolean;

    constructor(private store: Store) {}

    ngOnInit(): void {
        this.dataSource = new LoansDataSource(this.store);
        this.dataSource.loadLoans({
                sortOrder: this.sort.direction, sortName: this.sort.active || TableColumns.LOAN_TIME, page: 0,
                pageSize: this.paginator.pageSize || 5,
            });
    }

    ngAfterViewInit(): void {
        this.sortSubscription = this.sort.sortChange.subscribe(
            () => (this.paginator.pageIndex = 0)
        );

        this.mergeSubscription = merge(
            this.sort.sortChange,
            this.paginator.page
        )
            .pipe(tap(() => this.onLoadLoansPage()))
            .subscribe();
    }

    onLoadLoansPage(): void {
        this.dataSource.loadLoans({
            sortOrder: this.sort.direction, sortName: this.sort.active, page: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize
        });
    }

    ngOnDestroy(): void {
        this.mergeSubscription.add(this.sortSubscription);
        this.mergeSubscription.unsubscribe();
    }
}
