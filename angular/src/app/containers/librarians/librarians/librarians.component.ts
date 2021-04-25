import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LibrarianService } from '../../../services/librarian.service';
import { HelperService } from '../../../services/helper.service';
import { DepartmentService } from '../../../services/department.service';

import { AngularLinks } from '../../../constants/angularLinks';
import { TableColumns } from '../../../constants/tableColumns';
import { PageTitles } from '../../../constants/pageTitles';
import { SortOrder } from '../../../constants/sortOrder';

import { Librarian } from '../../../models/librarian.model';
import { Department } from '../../../models/department.model';

import { LibrariansDataSource } from '../../../datasources/librarians.datasource';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TABLE_ANIMATION } from '../../../constants/animation';

@Component({
    selector: 'app-librarians',
    templateUrl: './librarians.component.html',
    animations: TABLE_ANIMATION
})
export class LibrariansComponent implements OnInit, AfterViewInit, OnDestroy {
    librarians: Librarian[];
    departments: Department[];

    links = AngularLinks;

    columnsToDisplay: string[] = [
        TableColumns.NAME,
        TableColumns.EMAIL,
        TableColumns.DEPARTMENT_ADDRESS
    ];
    expandedElement: Librarian | null;
    tableColumns = TableColumns;

    filterName: string;
    filterValue: string;
    departmentSelect: number;

    dataSource: LibrariansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    constructor(
        private librarianService: LibrarianService,
        private departmentService: DepartmentService,
        public helperService: HelperService
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.LIBRARIANS;
        this.dataSource = new LibrariansDataSource(this.librarianService);
        this.dataSource.loadLibrarians('', '', null, SortOrder.ASC, 0, 5);
        this.subscriptionHandle();
    }

    subscriptionHandle(): void {
        this.departmentService.fetchAllDepartmentsHttp().pipe(untilDestroyed(this)).subscribe();
        this.departmentService.getDepartments().pipe(untilDestroyed(this)).subscribe((departments: Department[]) => {
            this.departments = departments;
        });
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.pipe(untilDestroyed(this)).subscribe(() => (this.paginator.pageIndex = 0));
        merge(this.sort.sortChange, this.paginator.page).pipe(untilDestroyed(this)).pipe(tap(() => this.loadLibrariansPage())).subscribe();
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

    ngOnDestroy(): void {}
}
