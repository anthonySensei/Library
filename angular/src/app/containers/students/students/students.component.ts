import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';


import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { AngularLinks } from '../../../constants/angularLinks';
import { TableColumns } from '../../../constants/tableColumns';
import { PageTitles } from '../../../constants/pageTitles';
import { SortOrder } from '../../../constants/sortOrder';
import { TABLE_ANIMATION } from '../../../constants/animation';

import { StudentService } from '../../../services/student.service';

import { UserPopupData } from '@shared/user-popup/user-popup.data';
import { UserPopupComponent } from '@shared/user-popup/user-popup.component';

import { StudentsDataSource } from '../../../datasources/students.datasource';


import { User } from '../../../models/user.model';
import { DeleteUser } from '../../../store/state/user.state';

@Component({
    selector: 'app-users',
    templateUrl: './students.component.html',
    animations: TABLE_ANIMATION
})
export class StudentsComponent implements OnInit, AfterViewInit, OnDestroy {
    filterValue: string;
    columnsToDisplay: string[] = [TableColumns.NAME, TableColumns.EMAIL, TableColumns.PHONE, TableColumns.STATUS];
    expandedElement: User | null;
    links = AngularLinks;
    dataSource: StudentsDataSource;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        private studentService: StudentService,
        private store: Store,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.STUDENTS;
        this.dataSource = new StudentsDataSource(this.store);
        this.dataSource
            .loadStudents('', this.sort.active || 'name', this.sort.direction || SortOrder.DESC, 0, this.paginator.pageSize || 5);
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.pipe(untilDestroyed(this)).subscribe(() => (this.paginator.pageIndex = 0));
        merge(this.sort.sortChange, this.paginator.page).pipe(tap(() => this.loadStudentsPage())).pipe(untilDestroyed(this)).subscribe();
    }

    loadStudentsPage(): void {
        this.dataSource
            .loadStudents(this.filterValue, this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
    }

    onOpenEditPopup(user) {
        const data: UserPopupData = { user, isEdit: true };
        const dialog = this.dialog.open(UserPopupComponent, { data, width: '768px', disableClose: true });
        dialog.afterClosed().pipe(untilDestroyed(this)).subscribe((res) => res && this.loadStudentsPage());
    }

    onOpenCreatePopup() {
        const dialog = this.dialog.open(UserPopupComponent, { data: {}, width: '768px', disableClose: true });
        dialog.afterClosed().pipe(untilDestroyed(this)).subscribe((res) => res && this.loadStudentsPage());
    }

    onDeleteStudent(id: string): void {
        this.store.dispatch(new DeleteUser(id)).subscribe(() => this.loadStudentsPage());
    }

    ngOnDestroy(): void {}
}
