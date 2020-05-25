import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Subscription } from 'rxjs';

import { MoveBookModalData } from './move-book-modal-data';
import { Department } from '../../../../models/department.model';

import { DepartmentService } from '../../../../services/department.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-move-book-modal',
    templateUrl: './move-book-modal.html',
    styleUrls: ['../../main-page/main-page.component.sass']
})
export class MoveBookModalComponent implements OnInit, OnDestroy {
    department = new FormControl('', [Validators.required]);
    quantity = new FormControl('', [Validators.required]);

    departments: Department[];

    departmentsFetchSubscription: Subscription;
    departmentsChangeSubscription: Subscription;

    error: boolean;

    constructor(
        public dialogRef: MatDialogRef<MoveBookModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MoveBookModalData,
        private departmentService: DepartmentService
    ) {
        dialogRef.disableClose = true;
    }

    ngOnInit(): void {
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsChangeSubscription = this.departmentService.getDepartments().subscribe(
            departments => {
                this.departments = departments.filter(
                    dep => dep.id !== this.data.bookDepartmentId
                );
            }
        );
    }

    ngOnDestroy(): void {}

    close(): void {
        if (
            !this.data.departmentId ||
            !this.data.booksToMove ||
            this.data.booksToMove > this.data.availableBooks
        ) {
            return;
        }
        this.dialogRef.close(this.data);
    }

    checkQuantity(): void {
        if (this.data.booksToMove > this.data.availableBooks) {
            this.quantity.setErrors({
                incorrect: true
            });
            this.error = true;
        } else {
            this.error = false;
        }
    }
}
