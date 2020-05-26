import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LibrarianService } from '../../../services/librarian.service';
import { HelperService } from '../../../services/helper.service';
import { DepartmentService } from '../../../services/department.service';

import { AngularLinks } from '../../../constants/angularLinks';

import { Librarian } from '../../../models/librarian.model';
import { Department } from '../../../models/department.model';

import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

import { LibrariansDataSource } from '../../../datasources/librarians.datasource';

@Component({
    selector: 'app-librarians',
    templateUrl: './librarians.component.html',
    styleUrls: ['../../../app.component.sass'],
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
export class LibrariansComponent implements OnInit, AfterViewInit, OnDestroy {
    librarians: Librarian[];
    departments: Department[];

    links = AngularLinks;

    mergeSubscription: Subscription;
    sortSubscription: Subscription;
    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;

    columnsToDisplay: string[] = ['name', 'email', 'departmentAddress'];
    expandedElement: Librarian | null;

    filterName: string;
    filterValue: string;
    departmentSelect: number;

    dataSource: LibrariansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    constructor(
        private librarianService: LibrarianService,
        private departmentService: DepartmentService,
        private helperService: HelperService
    ) {}

    ngOnInit(): void {
        document.title = 'Librarians';
        this.dataSource = new LibrariansDataSource(this.librarianService);
        this.dataSource.loadLibrarians('', '', null, 'asc', 0, 5);
        this.subscriptionHandle();
    }

    subscriptionHandle(): void {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
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
            .pipe(tap(() => this.loadLibrariansPage()))
            .subscribe();
    }

    loadLibrariansPage(): void {
        if (!this.filterName) {
            this.filterValue = '';
        }
        this.dataSource.loadLibrarians(
            this.filterName,
            this.filterValue,
            this.departmentSelect,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.departmentsSubscription, [
            this.departmentsFetchSubscription,
            this.mergeSubscription,
            this.sortSubscription
        ]);
    }
}
