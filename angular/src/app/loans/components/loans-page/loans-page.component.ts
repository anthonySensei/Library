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

import { Loan } from '../../models/loan.model';

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

    constructor(private loansService: LoansService) {}

    ngOnInit() {
        document.title = 'Loans';
        this.subscriptionsHandle();
    }

    subscriptionsHandle() {
        this.loansSubscription = this.loansService
            .fetchBooksLoansHttp()
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
        this.loansSubscription.unsubscribe();
        this.loansChangedSubscription.unsubscribe();
    }
}
