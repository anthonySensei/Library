import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output
} from '@angular/core';

import { Subscription } from 'rxjs';

import { ResponseService } from '../../../services/response.service';
import { DepartmentService } from '../../../services/department.service';
import { HelperService } from '../../../services/helper.service';

import { Department } from '../../../models/department.model';
import { AreYouSureComponent } from '../../../shared/confirm-delete-modal/are-you-sure.component';
import { ModalWidth } from '../../../constants/modalWidth';
import { MatDialog } from '@angular/material';

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

    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    departmentsAddSubscription: Subscription;
    departmentsEditSubscription: Subscription;
    departmentsDeleteSubscription: Subscription;

    constructor(private dialog: MatDialog) {}

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

    openConfirmDeleteDialog(): void {
        const dialogRef = this.dialog.open(AreYouSureComponent, {
            width: ModalWidth.W30P
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteDepartment();
            }
        });
    }

    departmentResponseHandler(): void {
        if (this.responseService.responseHandle()) {
            this.departmentsFetchSubscription = this.departmentService
                .fetchAllDepartmentsHttp()
                .subscribe();
            this.departmentsSubscription = this.departmentService
                .getDepartments()
                .subscribe((departments: Department[]) => {
                    this.departments = departments;
                });
            this.newDepartmentAddress = null;
        }
    }

    ngOnDestroy(): void {
        if (this.departmentsSubscription) {
            this.helperService.unsubscribeHandle(this.departmentsSubscription, [
                this.departmentsFetchSubscription,
                this.departmentsAddSubscription,
                this.departmentsEditSubscription,
                this.departmentsDeleteSubscription
            ]);
        }
    }
}
