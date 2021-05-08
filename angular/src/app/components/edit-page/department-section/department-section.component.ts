import { Component, OnDestroy, OnInit } from '@angular/core';

import { Department } from '../../../models/department.model';
import { MatDialog } from '@angular/material/dialog';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select, Store } from '@ngxs/store';
import { MatTableDataSource } from '@angular/material/table';
import { DeleteDepartment, DepartmentState, LoadDepartments } from '../../../store/state/department.state';
import { Observable } from 'rxjs';
import { DepartmentPopupComponent } from '../../popups/department-popup/department-popup.component';

@Component({
    selector: 'app-department-section',
    templateUrl: './department-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class DepartmentSectionComponent implements OnInit, OnDestroy {

    dataSource = new MatTableDataSource([]);
    displayedColumns: string[] = ['name', 'address', 'actions'];

    @Select(DepartmentState.Departments)
    departments$: Observable<Department[]>;

    constructor(
        private store: Store,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.getDepartments$();
    }

    getDepartments$() {
        this.store.dispatch(new LoadDepartments());
        this.departments$.pipe(untilDestroyed(this)).subscribe(departments => this.dataSource = new MatTableDataSource(departments));
    }

    openConfirmDeleteDialog(): void {
        // const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
        //     width: ModalWidth.W30P
        // });
        //
        // dialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         this.deleteDepartment();
        //     }
        // });
    }

    openDepartmentPopup(data: Department) {
        this.dialog.open(DepartmentPopupComponent, {data, disableClose: true, width: `569px`});
    }

    onApplyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    onAddDepartment(): void {
        this.openDepartmentPopup({} as Department);
    }

    onEditDepartment(author: Department): void {
        this.openDepartmentPopup(author);
    }

    onDeleteDepartment(id: string): void {
        this.store.dispatch(new DeleteDepartment(id));
    }

    ngOnDestroy(): void {}
}
