import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

import { ResponseService } from '../../shared/services/response.service';
import { DepartmentService } from '../../main-page/services/department.service';

import { Department } from '../../main-page/models/department.model';
import { Response } from '../../main-page/models/response.model';

import { SnackBarClasses } from '../../constants/snackBarClasses';

@Component({
    selector: 'app-department-section',
    templateUrl: './department-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class DepartmentSectionComponent implements OnInit, OnDestroy {
    @Output() onOpenSnackbar = new EventEmitter();
    @Output() onNothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() departmentService: DepartmentService;
    @Input() departmentSelect: number;
    @Input() departments: Department[];

    departmentAddress = null;
    newDepartmentAddress = null;

    showDepartmentAdding = false;

    response: Response;

    constructor() {}

    ngOnInit() {}

    getDepartment(): Department {
        return this.departments.find(dep => dep.id === this.departmentSelect);
    }

    setDepartmentAddress() {
        if (this.departmentSelect) {
            this.departmentAddress = this.getDepartment().address;
        }
    }

    addDepartment() {
        this.departmentService
            .addDepartmentHttp({ id: null, address: this.newDepartmentAddress })
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                this.departmentResponseHandler();
            });
    }

    editDepartment() {
        if (!this.departmentAddress) {
            return;
        }
        if (this.departmentAddress === this.getDepartment().address) {
            this.onNothingToChange.emit();
            return;
        }
        this.departmentService
            .editDepartmentHttp(this.departmentSelect, this.departmentAddress)
            .subscribe(() => {
                this.departmentResponseHandler();
            });
    }

    deleteDepartment() {
        if (!this.departmentSelect) {
            return;
        }
        this.departmentService
            .deleteDepartmentHttp(this.departmentSelect)
            .subscribe(() => {
                this.departmentResponseHandler();
                this.departmentAddress = null;
                this.departmentSelect = null;
            });
    }

    departmentResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.departmentService.fetchAllDepartmentsHttp().subscribe();
            this.departments = this.departmentService.getDepartments();
            this.newDepartmentAddress = null;
        } else {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    ngOnDestroy(): void {}
}
