import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HelperService } from '../../../services/helper.service';

import { AngularLinks } from '../../../constants/angularLinks';
import { TableColumns } from '../../../constants/tableColumns';
import { PageTitles } from '../../../constants/pageTitles';
import { SortOrder } from '../../../constants/sortOrder';

import { LibrariansDataSource } from '../../../datasources/librarians.datasource';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TABLE_ANIMATION } from '../../../constants/animation';
import { Store } from '@ngxs/store';
import { UserPopupData } from '@shared/user-popup/user-popup.data';
import { UserPopupComponent } from '@shared/user-popup/user-popup.component';
import { DeleteUser } from '../../../store/state/user.state';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-librarians',
    templateUrl: './librarians.component.html',
    animations: TABLE_ANIMATION
})
export class LibrariansComponent implements OnInit, AfterViewInit, OnDestroy {
    filterValue: string;
    links = AngularLinks;
    columnsToDisplay: string[] = [
        TableColumns.NAME,
        TableColumns.EMAIL,
        TableColumns.PHONE
    ];
    expandedElement: User | null;
    tableColumns = TableColumns;


    dataSource: LibrariansDataSource;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    constructor(
        private store: Store,
        public helperService: HelperService,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.LIBRARIANS;
        this.dataSource = new LibrariansDataSource(this.store);
        this.dataSource.loadLibrarians('', this.sort.active || 'name', SortOrder.DESC, 0, this.paginator.pageSize || 5);
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.pipe(untilDestroyed(this)).subscribe(() => (this.paginator.pageIndex = 0));
        merge(this.sort.sortChange, this.paginator.page).pipe(untilDestroyed(this)).pipe(tap(() => this.loadLibrariansPage())).subscribe();
    }

    loadLibrariansPage(): void {
        this.dataSource
            .loadLibrarians(this.filterValue, this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
    }

    onOpenEditPopup(user) {
        const data: UserPopupData = { user, isEdit: true };
        const dialog = this.dialog.open(UserPopupComponent, { data, width: '768px', disableClose: true });
        dialog.afterClosed().pipe(untilDestroyed(this)).subscribe((res) => res && this.loadLibrariansPage());
    }

    onOpenCreatePopup() {
        const dialog = this.dialog.open(UserPopupComponent, { data: { isLibrarian: true }, width: '768px', disableClose: true });
        dialog.afterClosed().pipe(untilDestroyed(this)).subscribe((res) => res && this.loadLibrariansPage());
    }

    onDeleteStudent(id: string): void {
        this.store.dispatch(new DeleteUser(id)).subscribe(() => this.loadLibrariansPage());
    }

    ngOnDestroy(): void {}
}
