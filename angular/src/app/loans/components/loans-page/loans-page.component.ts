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

import { LoansService } from '../../services/loans.service';
import { ResponseService } from '../../../shared/services/response.service';

import { Loan } from '../../models/loan.model';
import { Response } from '../../../main-page/models/response.model';
import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { MaterialService } from '../../../shared/services/material.service';

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

    loansSubscription: Subscription;
    loansChangedSubscription: Subscription;

    response: Response;

    snackbarDuration = 3000;

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

    constructor(
        private loansService: LoansService,
        private responseService: ResponseService,
        private materialService: MaterialService
    ) {}

    ngOnInit() {
        document.title = 'Loans';
        this.subscriptionsHandle();
    }

    subscriptionsHandle() {
        this.loansSubscription = this.loansService.fetchLoansHttp().subscribe();
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

    returnBook(loanId: any, bookId: any) {
        this.loansService
            .returnBookHttp(loanId, bookId, new Date())
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                if (this.response.isSuccessful) {
                    this.materialService.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                    this.loansService.fetchLoansHttp().subscribe();
                    this.loans = this.loansService.getLoans();
                } else {
                    this.materialService.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Danger,
                        this.snackbarDuration
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.loansSubscription.unsubscribe();
        this.loansChangedSubscription.unsubscribe();
    }
}
