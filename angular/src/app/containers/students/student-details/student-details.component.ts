import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Subscription } from 'rxjs';

import { Student } from '../../../models/student.model';
import { Department } from '../../../models/department.model';

import { StudentService } from '../../../services/student.service';
import { HelperService } from '../../../services/helper.service';
import { DepartmentService } from '../../../services/department.service';

@Component({
    selector: 'app-user-details',
    templateUrl: './student-details.component.html',
    styleUrls: ['./student-details.component.sass']
})
export class StudentDetailsComponent implements OnInit, OnDestroy {
    departments: Department[];

    student: Student;
    studentId: number;

    departmentsSubscription: Subscription;
    departmentsFetchSubscription: Subscription;
    studentFetchSubscription: Subscription;
    studentSubscription: Subscription;
    paramsSubscription: Subscription;

    isLoading: boolean;

    constructor(
        private studentService: StudentService,
        private helperService: HelperService,
        private departmentService: DepartmentService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        document.title = 'Student';
        this.isLoading = true;
        this.paramsSubscription = this.route.params.subscribe(
            (params: Params) => {
                this.studentId = +params.id;
                this.studentSubscriptionHandle();
            }
        );
    }

    studentSubscriptionHandle(): void {
        this.studentFetchSubscription = this.studentService
            .getStudentHttp(this.studentId)
            .subscribe();
        this.studentSubscription = this.studentService
            .getStudent()
            .subscribe((student: Student) => {
                this.student = student;
                this.isLoading = false;
            });
        this.departmentsFetchSubscription = this.departmentService
            .fetchAllDepartmentsHttp()
            .subscribe();
        this.departmentsSubscription = this.departmentService
            .getDepartments()
            .subscribe((departments: Department[]) => {
                this.departments = departments;
            });
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.studentSubscription, [
            this.studentFetchSubscription,
            this.paramsSubscription,
            this.departmentsFetchSubscription,
            this.departmentsSubscription
        ]);
    }
}
