import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LibrarianService } from '../../services/librarian.service';
import { Loan } from '../../../loans/models/loan.model';
import { Subscription } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Librarian } from '../../models/librarian.model';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-librarian-details',
    templateUrl: './librarian-details.component.html',
    styleUrls: ['./librarian-details.component.sass']
})
export class LibrarianDetailsComponent implements OnInit, OnDestroy {
    loans: Loan[];
    schedule;

    librarian: Librarian;
    librarianId: number;

    librarianSubscription: Subscription;
    librarianChangedSubscription: Subscription;

    paramsSubscription: Subscription;

    isLoading = false;

    displayedLoansColumns: string[] = [
        'loanTime',
        'returnedTime',
        'bookISBN',
        'studentTicketReader'
    ];

    displayedScheduleColumns: string[] = ['day', 'start', 'end'];

    loansDataSource: MatTableDataSource<Loan>;
    @ViewChild(MatPaginator, { static: true }) loansPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) loansSort: MatSort;

    scheduleDataSource: MatTableDataSource<Loan>;
    @ViewChild(MatSort, { static: true }) scheduleSort: MatSort;

    constructor(
        private librarianService: LibrarianService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        document.title = 'Librarian';
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.librarianId = +params.id;
                this.librarianSubscriptionHandle();
            }
        );
    }

    librarianSubscriptionHandle() {
        this.librarianSubscription = this.librarianService
            .getLibrarianHttp(this.librarianId)
            .subscribe();
        this.librarianChangedSubscription = this.librarianService.librarianChanged.subscribe(
            librarian => {
                this.librarian = librarian;
                this.loans = this.librarian.loans;
                this.loansDataSource = new MatTableDataSource(this.loans);
                this.loansDataSource.paginator = this.loansPaginator;
                this.loansDataSource.sort = this.loansSort;
                this.schedule = this.librarian.schedule;
                this.scheduleDataSource = new MatTableDataSource(this.schedule);
                this.scheduleDataSource.sort = this.scheduleSort;
                this.isLoading = false;
            }
        );
        this.librarian = this.librarianService.getLibrarian();
    }

    applyLoansFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.loansDataSource.filter = filterValue.trim().toLowerCase();

        if (this.loansDataSource.paginator) {
            this.loansDataSource.paginator.firstPage();
        }
    }

    ngOnDestroy(): void {
        this.librarianSubscription.unsubscribe();
        this.librarianChangedSubscription.unsubscribe();
        this.paramsSubscription.unsubscribe();
    }
}
