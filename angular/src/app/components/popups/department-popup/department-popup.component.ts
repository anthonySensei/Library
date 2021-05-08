import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Department } from '../../../models/department.model';
import { Observable } from 'rxjs';
import { StoreStateModel } from '../../../store/models/store.model';
import { CreateDepartment, EditDepartment } from '../../../store/state/department.state';

@Component({
    selector: 'app-department-popup',
    templateUrl: './department-popup.component.html',
    styleUrls: ['./department-popup.component.scss']
})
export class DepartmentPopupComponent implements OnInit {

    isEdit: boolean;
    form: FormGroup;

    constructor(
        private store: Store,
        public dialogRef: MatDialogRef<DepartmentPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Department
    ) {}

    ngOnInit(): void {
        this.isEdit = !!this.data.id;
        this.initForm();
    }

    initForm() {
        const { name, address } = this.data;
        this.form = new FormGroup({
            name: new FormControl(name || '', [Validators.required]),
            address: new FormControl(address || '', [Validators.required])
        });
    }

    isInvalid(): boolean {
        return this.form.invalid;
    }

    getTitle(): string {
        return this.isEdit ? `Edit Department` : `Add Department`;
    }

    addDepartment(): Observable<StoreStateModel> {
        const { name, address } = this.form.value;
        return this.store.dispatch(new CreateDepartment({ name, address }));
    }

    editDepartment(): Observable<StoreStateModel> {
        const { name, address } = this.form.value;
        return this.store.dispatch(new EditDepartment(this.data.id, { name, address }));
    }

    onDoAction() {
        if (this.isInvalid()) {
            return;
        }

        (this.isEdit ? this.editDepartment() : this.addDepartment()).subscribe(() => this.onClose());
    }

    onClose() {
        this.dialogRef.close();
    }
}
