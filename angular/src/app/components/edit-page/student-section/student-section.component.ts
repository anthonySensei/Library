import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { Student } from '../../../models/student.model';

import { ResponseService } from '../../../services/response.service';
import { StudentService } from '../../../services/student.service';
import { HelperService } from '../../../services/helper.service';

import { AngularLinks } from '../../../constants/angularLinks';
import { MatDialog } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';

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

    studentSelect: number;
    studentReaderTicket: string;
    studentEmail: string;

    error: string;

    links = AngularLinks;

    constructor(
        private studentService: StudentService,
        private router: Router,
        private dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.setStudents();
    }

    setStudents(): void {
        this.studentService.getAllStudentsHttp().pipe(untilDestroyed(this)).subscribe();
        this.studentService.getStudents().pipe(untilDestroyed(this)).subscribe((students: Student[]) => {
            this.students = students;
        });
    }

    getStudent(): Student {
        return this.students.find((st: Student) => st.id === this.studentSelect);
    }

    setStudentData(): void {
        if (this.studentSelect) {
            this.studentReaderTicket = this.getStudent().readerTicket;
            this.studentEmail = this.getStudent().email;
        }
    }

    addStudent(): void {
        this.router.navigate(['/', this.links.STUDENTS, 'add']);
    }

    editStudent(): void {
        if (!this.studentEmail || !this.studentReaderTicket) {
            return;
        }

        if (
            this.studentEmail === this.getStudent().email &&
            this.studentReaderTicket === this.getStudent().readerTicket
        ) {
            this.nothingToChange.emit();
            return;
        }

        this.studentService
            .ediStudentHttp(
                this.studentSelect,
                this.studentEmail,
                this.studentReaderTicket
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
            this.setStudents();
            this.studentSelect = null;
            this.studentEmail = null;
            this.studentReaderTicket = null;
        }
    }

    ngOnDestroy(): void {}
}
