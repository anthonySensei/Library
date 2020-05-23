import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output
} from '@angular/core';

import { ResponseService } from '../../../services/response.service';
import { DepartmentService } from '../../../services/department.service';

import { Department } from '../../../models/department.model';
import { Response } from '../../../models/response.model';

import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-department-section',
    templateUrl: './department-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class DepartmentSectionComponent implements OnDestroy {
    @Output() openSnackbar = new EventEmitter();
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() departmentService: DepartmentService;
    @Input() departmentSelect: number;
    @Input() departments: Department[];

    departmentAddress: string = null;
    newDepartmentAddress: string = null;

    showDepartmentAdding: boolean;

    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    departmentsAddSubscription: Subscription;
    departmentsEditSubscription: Subscription;
    departmentsDeleteSubscription: Subscription;

    response: Response;

    constructor() {}

    getDepartment(): Department {
        return this.departments.find(dep => dep.id === this.departmentSelect);
    }

    setDepartmentAddress(): void {
        if (this.departmentSelect) {
            this.departmentAddress = this.getDepartment().address;
        }
    }

    addDepartment(): void {
        this.departmentsAddSubscription = this.departmentService
            .addDepartmentHttp({ id: null, address: this.newDepartmentAddress })
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
        this.departmentsEditSubscription = this.departmentService
            .editDepartmentHttp(this.departmentSelect, this.departmentAddress)
            .subscribe(() => {
                this.departmentResponseHandler();
            });
    }

    deleteDepartment(): void {
        if (!this.departmentSelect) {
            return;
        }
        this.departmentsDeleteSubscription = this.departmentService
            .deleteDepartmentHttp(this.departmentSelect)
            .subscribe(() => {
                this.departmentResponseHandler();
                this.departmentAddress = null;
                this.departmentSelect = null;
            });
    }

    departmentResponseHandler(): void {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.departmentsFetchSubscription = this.departmentService
                .fetchAllDepartmentsHttp()
                .subscribe();
            this.departmentsSubscription = this.departmentService
                .getDepartments()
                .subscribe((departments: Department[]) => {
                    this.departments = departments;
                });
            this.newDepartmentAddress = null;
        } else {
            this.openSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    ngOnDestroy(): void {
        if (this.departmentsSubscription) {
            this.departmentsSubscription.add(this.departmentsFetchSubscription);
            this.departmentsSubscription.add(this.departmentsAddSubscription);
            this.departmentsSubscription.add(this.departmentsEditSubscription);
            this.departmentsSubscription.add(
                this.departmentsDeleteSubscription
            );
            this.departmentsSubscription.unsubscribe();
        }
    }
}
