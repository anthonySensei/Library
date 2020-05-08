import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

import { Subscription } from 'rxjs';

import { LibrarianService } from '../../services/librarian.service';
import { AngularLinks } from '../../../constants/angularLinks';

import { Librarian } from '../../models/librarian.model';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

@Component({
    selector: 'app-librarians',
    templateUrl: './librarians.component.html',
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
export class LibrariansComponent implements OnInit, OnDestroy {
    librarians: Librarian[];

    links = AngularLinks;

    librariansSubscription: Subscription;
    librariansChangedSubscription: Subscription;

    columnsToDisplay: string[] = ['name', 'email', 'departmentAddress'];
    expandedElement: Librarian | null;

    dataSource: MatTableDataSource<Librarian>;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    constructor(private librarianService: LibrarianService) {}

    ngOnInit() {
        document.title = 'Librarians';
        this.subscriptionHandle();
    }

    subscriptionHandle() {
        this.librariansSubscription = this.librarianService
            .getLibrariansHttp()
            .subscribe();
        this.librariansChangedSubscription = this.librarianService.librariansChanged.subscribe(
            librarians => {
                this.librarians = librarians;
                this.dataSource = new MatTableDataSource(this.librarians);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            }
        );
        this.librarians = this.librarianService.getLibrarians();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    ngOnDestroy(): void {
        this.librariansSubscription.unsubscribe();
        this.librariansChangedSubscription.unsubscribe();
    }
}
