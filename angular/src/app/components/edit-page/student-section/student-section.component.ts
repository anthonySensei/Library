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
import { DeleteStudent, LoadStudents, SetStudent, StudentState } from '../../../store/student.state';
import { SortOrder } from '../../../constants/sortOrder';
import { UserState } from '../../../store/user.state';

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
    error: string;
    links = AngularLinks;

    @Select(StudentState.Students)
    students$: Observable<User[]>;

    @Select(StudentState.Student)
    student$: Observable<User>;

    constructor(
        private studentService: StudentService,
        private router: Router,
        private dialog: MatDialog,
        private store: Store
    ) {}

    ngOnInit(): void {}

    deleteStudent(): void {
        const student = this.store.selectSnapshot(UserState.User);

        if (!student) {
            return;
        }

        this.store.dispatch(new DeleteStudent()).subscribe(() => this.studentSelect = null);
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
        }
    }

    onChange(): void {
        this.store.dispatch(new LoadStudents('name', this.studentSelect, SortOrder.DESC, 0, 100));
    }

    onSetStudent(student: User) {
        this.store.dispatch(new SetStudent(student));
    }

    ngOnDestroy(): void {}
}
