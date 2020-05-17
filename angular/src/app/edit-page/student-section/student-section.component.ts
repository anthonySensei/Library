import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

import { Subscription } from 'rxjs';

import { Response } from '../../main-page/models/response.model';
import { Student } from '../../user/models/student.model';
import { ResponseService } from '../../shared/services/response.service';
import { StudentService } from '../../user/services/student.service';

import { SnackBarClasses } from '../../constants/snackBarClasses';
import { Router } from '@angular/router';
import { AngularLinks } from '../../constants/angularLinks';

@Component({
    selector: 'app-student-section',
    templateUrl: './student-section.component.html',
    styleUrls: ['../edit-page.component.sass']
})
export class StudentSectionComponent implements OnInit, OnDestroy {
    @Output() onOpenSnackbar = new EventEmitter();
    @Output() onNothingToChange = new EventEmitter();

    @Input() responseService: ResponseService;

    students: Student[];

    studentsSubscription: Subscription;
    studentsChangedSubscription: Subscription;

    studentSelect = null;
    studentReaderTicket = null;
    studentEmail = null;
    newStudentReaderTicket = null;
    newStudentEmail = null;
    newStudentName = null;

    error = null;

    response: Response;

    links = AngularLinks;

    constructor(
        private studentService: StudentService,
        private router: Router
    ) {}

    ngOnInit() {
        this.studentsSubscription = this.studentService
            .getStudentsHttp()
            .subscribe();
        this.studentsChangedSubscription = this.studentService.studentsChanged.subscribe(
            students => {
                this.students = students;
            }
        );
    }

    getStudent(): Student {
        return this.students.find(st => st.id === this.studentSelect);
    }

    setStudentData() {
        if (this.studentSelect) {
            this.studentReaderTicket = this.getStudent().readerTicket;
            this.studentEmail = this.getStudent().email;
        }
    }

    addStudent() {
        this.router.navigate(['/', this.links.STUDENTS, 'add']);
    }

    editStudent() {
        if (!this.studentEmail || !this.studentReaderTicket) {
            return;
        }
        if (
            this.studentEmail === this.getStudent().email &&
            this.studentReaderTicket === this.getStudent().readerTicket
        ) {
            this.onNothingToChange.emit();
            return;
        }
        this.studentService
            .ediStudentHttp(
                this.studentSelect,
                this.studentEmail,
                this.studentReaderTicket
            )
            .subscribe(() => {
                this.studentResponseHandler();
            });
    }

    deleteStudent() {
        if (!this.studentSelect) {
            return;
        }
        this.studentService
            .deleteStudentHttp(this.studentSelect)
            .subscribe(() => {
                this.studentResponseHandler();
                this.studentSelect = null;
                this.studentEmail = null;
                this.studentReaderTicket = null;
            });
    }

    studentResponseHandler() {
        this.response = this.responseService.getResponse();
        if (this.response.isSuccessful) {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Success
            ]);
            this.studentService.getStudentsHttp().subscribe();
            this.students = this.studentService.getStudents();
            this.newStudentReaderTicket = null;
            this.newStudentEmail = null;
        } else {
            this.onOpenSnackbar.emit([
                this.response.message,
                SnackBarClasses.Danger
            ]);
        }
    }

    ngOnDestroy(): void {
        this.studentsChangedSubscription.unsubscribe();
        this.studentsSubscription.unsubscribe();
    }
}
