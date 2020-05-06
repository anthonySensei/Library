import { Component, OnInit, ViewChild } from '@angular/core';
import { LibrarianService } from '../../services/librarian.service';
import { Student } from '../../models/student.model';
import { angularLinks } from '../../../constants/angularLinks';
import { Subscription } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Librarian } from '../../models/librarian.model';

@Component({
    selector: 'app-librarians',
    templateUrl: './librarians.component.html',
    styleUrls: ['./librarians.component.sass']
})
export class LibrariansComponent implements OnInit {
    librarians: Librarian[];

    links = angularLinks;

    librariansSubscription: Subscription;
    librariansChangedSubscription: Subscription;

    columnsToDisplay: string[] = ['name', 'email'];
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
}
