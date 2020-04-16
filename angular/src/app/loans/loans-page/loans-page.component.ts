import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

import { LoansService } from '../loans.service';
import { Loan } from '../loan.model';
import { Subscription } from 'rxjs';

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

    columnsToDisplay = [
        'loanTime',
        'returnedTime',
        'bookISBN',
        'studentReaderTicket',
        'librarianEmail'
    ];
    expandedElement: Loan | null;

    constructor(private loansService: LoansService) {}

    ngOnInit() {
        this.subscriptionsHandle();
    }

    subscriptionsHandle() {
        this.loansSubscription = this.loansService
            .fetchBooksLoansHttp()
            .subscribe();
        this.loansChangedSubscription = this.loansService.loansChanged.subscribe(
            loans => {
                this.loans = loans;
            }
        );
        this.loans = this.loansService.getLoans();
    }

    ngOnDestroy(): void {
        this.loansSubscription.unsubscribe();
        this.loansChangedSubscription.unsubscribe();
    }
}
