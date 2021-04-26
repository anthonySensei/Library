import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { Student } from '../../../models/student.model';

import { ResponseService } from '../../../services/response.service';
import { StudentService } from '../../../services/student.service';
import { HelperService } from '../../../services/helper.service';

import { AngularLinks } from '../../../constants/angularLinks';
import { MatDialog } from '@angular/material/dialog';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { LoadStudents, StudentState } from '../../../store/student.state';
import { SortOrder } from '../../../constants/sortOrder';
import * as _ from 'lodash';

@Component({
    selector: 'app-student-section',
    templateUrl: './student-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class StudentSectionComponent implements OnInit, OnDestroy {
    @Output() nothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;
    @Input() helperService: HelperService;

    students: Student[];

    studentSelect: string;
    studentEmail: string;
    error: string;
    links = AngularLinks;

    @Select(StudentState.Students)
    students$: Observable<User[]>;

    constructor(
        private studentService: StudentService,
        private router: Router,
        private dialog: MatDialog,
        private store: Store
    ) {}

    ngOnInit(): void {}

    getStudent(): Student {
        return this.students.find((st: Student) => st.id === this.studentSelect);
    }

    addStudent(): void {
        this.router.navigate(['/', this.links.STUDENTS, 'add']);
    }

    editStudent(): void {
        if (!this.studentEmail) {
            return;
        }

        if (
            this.studentEmail === this.getStudent().email
        ) {
            this.nothingToChange.emit();
            return;
        }

        this.studentService
            .ediStudentHttp(
                this.studentSelect,
                this.studentEmail,
            )
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.studentResponseHandler();
            });
    }

    deleteStudent(): void {
        if (!this.studentSelect) {
            return;
        }

        this.studentService.deleteStudentHttp(this.studentSelect).pipe(untilDestroyed(this)).subscribe(() => {
            this.studentResponseHandler();
        });
    }

    openConfirmDeleteDialog(): void {
        // const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
        //     width: ModalWidth.W30P
        // });
        //
        // dialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         this.deleteStudent();
        //     }
        // });
    }

    studentResponseHandler(): void {
        if (this.responseService.responseHandle()) {
            this.studentSelect = null;
            this.studentEmail = null;
        }
    }

    onChange(): void {
        this.store.dispatch(new LoadStudents('name', this.studentSelect, SortOrder.DESC, 0, 100));
    }

    onSetStudent(student: User) {
        this.studentEmail = student.email;
    }

    ngOnDestroy(): void {}
}
