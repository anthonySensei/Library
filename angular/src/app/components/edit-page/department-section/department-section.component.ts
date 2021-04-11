import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

import { ResponseService } from '../../../services/response.service';
import { DepartmentService } from '../../../services/department.service';
import { HelperService } from '../../../services/helper.service';

import { Department } from '../../../models/department.model';
import { MatDialog } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
    selector: 'app-department-section',
    templateUrl: './department-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class DepartmentSectionComponent implements OnDestroy {
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() helperService: HelperService;
    @Input() departmentService: DepartmentService;
    @Input() departmentSelect: number;
    @Input() departments: Department[];

    departmentAddress: string = null;
    newDepartmentAddress: string = null;

    showDepartmentAdding: boolean;

    constructor(private dialog: MatDialog) {
    }

    getDepartment(): Department {
        return this.departments.find(dep => dep.id === this.departmentSelect);
    }

    setDepartmentAddress(): void {
        if (this.departmentSelect) {
            this.departmentAddress = this.getDepartment().address;
        }
    }

    addDepartment(): void {
        this.departmentService
            .addDepartmentHttp({ id: null, address: this.newDepartmentAddress })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.departmentResponseHandler();
            });
    }

    editDepartment(): void {
        if (!this.departmentAddress) {
            return;
        }
        if (this.departmentAddress === this.getDepartment().address) {
            this.nothingToChange.emit();
            return;
        }
        this.departmentService
            .editDepartmentHttp(this.departmentSelect, this.departmentAddress)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.departmentResponseHandler();
            });
    }

    deleteDepartment(): void {
        if (!this.departmentSelect) {
            return;
        }
        this.departmentService.deleteDepartmentHttp(this.departmentSelect).pipe(untilDestroyed(this)).subscribe(() => {
            this.departmentResponseHandler();
            this.departmentAddress = null;
            this.departmentSelect = null;
        });
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

    departmentResponseHandler(): void {
        if (this.responseService.responseHandle()) {
            this.departmentService.fetchAllDepartmentsHttp().pipe(untilDestroyed(this)).subscribe();
            this.departmentService.getDepartments().pipe(untilDestroyed(this)).subscribe((departments: Department[]) => {
                this.departments = departments;
            });
            this.newDepartmentAddress = null;
        }
    }

    ngOnDestroy(): void {
    }
}
