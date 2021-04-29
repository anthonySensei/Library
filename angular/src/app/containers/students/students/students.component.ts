import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';

import { Student } from '../../../models/student.model';

import { AngularLinks } from '../../../constants/angularLinks';
import { TableColumns } from '../../../constants/tableColumns';
import { PageTitles } from '../../../constants/pageTitles';
import { SortOrder } from '../../../constants/sortOrder';

import { StudentService } from '../../../services/student.service';
import { HelperService } from '../../../services/helper.service';

import { StudentsDataSource } from '../../../datasources/students.datasource';
import { TABLE_ANIMATION } from '../../../constants/animation';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Store } from '@ngxs/store';
import { UserPopupData } from '@shared/user-popup/user-popup.data';
import { UserPopupComponent } from '@shared/user-popup/user-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteStudent } from '../../../store/student.state';

@Component({
    selector: 'app-users',
    templateUrl: './students.component.html',
    animations: TABLE_ANIMATION
})
export class StudentsComponent implements OnInit, AfterViewInit, OnDestroy {
    students: Student[];

    links = AngularLinks;

    columnsToDisplay: string[] = [
        TableColumns.NAME,
        TableColumns.EMAIL,
        TableColumns.STATUS
    ];
    expandedElement: Student | null;

    filterName: string;
    filterValue: string;

    dataSource: StudentsDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        private studentService: StudentService,
        public helperService: HelperService,
        private store: Store,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.STUDENTS;
        this.dataSource = new StudentsDataSource(this.store);
        this.dataSource.loadStudents('', '', SortOrder.DESC, 0, 5);
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.pipe(untilDestroyed(this)).subscribe(() => (this.paginator.pageIndex = 0));
        merge(this.sort.sortChange, this.paginator.page).pipe(tap(() => this.loadStudentsPage())).pipe(untilDestroyed(this)).subscribe();
    }

    loadStudentsPage(): void {
        if (!this.filterName) {
            this.filterValue = '';
        }

        this.dataSource.loadStudents(
            this.filterName,
            this.filterValue,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );
    }

    onOpenEditPopup(user) {
        const data: UserPopupData = { user, isEdit: true };
        const dialog = this.dialog.open(UserPopupComponent, { data, width: '768px', disableClose: true });
        dialog.afterClosed().pipe(untilDestroyed(this)).subscribe(() => this.loadStudentsPage());
    }

    onOpenCreatePopup() {
        const dialog = this.dialog.open(UserPopupComponent, { data: {}, width: '768px', disableClose: true });
        dialog.afterClosed().pipe(untilDestroyed(this)).subscribe(() => this.loadStudentsPage());
    }

    onDeleteStudent(id: string): void {
        this.store.dispatch(new DeleteStudent(id)).subscribe(() => this.loadStudentsPage());
    }

    ngOnDestroy(): void {}
}
