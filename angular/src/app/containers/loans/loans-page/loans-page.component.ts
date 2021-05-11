import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoansService } from '../../../services/loans.service';
import { ResponseService } from '../../../services/response.service';
import { HelperService } from '../../../services/helper.service';

import { Loan } from '../../../models/loan.model';
import { Department } from '../../../models/department.model';

import { LoansDataSource } from '../../../datasources/loans.datasource';

import { TableColumns } from '../../../constants/tableColumns';
import { PageTitles } from '../../../constants/pageTitles';
import { SortOrder } from '../../../constants/sortOrder';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TABLE_ANIMATION } from '../../../constants/animation';

@Component({
    selector: 'app-loan-page',
    templateUrl: './loans-page.component.html',
    animations: TABLE_ANIMATION
})
export class LoansPageComponent implements OnInit, AfterViewInit, OnDestroy {

    columnsToDisplay: string[] = [
        TableColumns.LOAN_TIME,
        TableColumns.RETURNED_TIME,
        TableColumns.BOOK_ISBN,
        TableColumns.READER_TICKET,
        TableColumns.EMAIL
    ];
    expandedElement: Loan | null;
    tableColumns = TableColumns;
    departments: Department[];

    filterName: string;
    filterValue: string;
    departmentSelect: number;
    date: Date;

    dataSource: LoansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isShowingDebtors: boolean;

    constructor(
        private loansService: LoansService,
        public helperService: HelperService,
        private responseService: ResponseService
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.LOANS;
        this.dataSource = new LoansDataSource(this.loansService);
        this.dataSource.loadLoans(
            '',
            '',
            SortOrder.DESC,
            0,
            5,
            null,
            null,
            false
        );
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.pipe(untilDestroyed(this)).subscribe(
            () => (this.paginator.pageIndex = 0)
        );

        merge(
            this.sort.sortChange,
            this.paginator.page
        ).pipe(untilDestroyed(this)).pipe(tap(() => this.loadLoansPage())).subscribe();
    }

    returnBook(loanId: any, bookId: any): void {
        this.loansService.returnBookHttp(loanId, bookId, new Date()).pipe(untilDestroyed(this)).subscribe(() => {
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

    ngOnDestroy(): void {}
}
