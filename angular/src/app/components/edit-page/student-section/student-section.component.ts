import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { Student } from '../../../models/student.model';

import { ResponseService } from '../../../services/response.service';
import { StudentService } from '../../../services/student.service';
import { HelperService } from '../../../services/helper.service';

import { AngularLinks } from '../../../constants/angularLinks';

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

    studentsSubscription: Subscription;
    studentsFetchSubscription: Subscription;
    studentsEditSubscription: Subscription;
    studentsDeleteSubscription: Subscription;

    studentSelect: number;
    studentReaderTicket: string;
    studentEmail: string;
    newStudentReaderTicket: string;
    newStudentEmail: string;

    error: string;

    links = AngularLinks;

    constructor(
        private studentService: StudentService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.setStudents();
    }

    setStudents(): void {
        this.studentsFetchSubscription = this.studentService
            .getAllStudentsHttp()
            .subscribe();
        this.studentsSubscription = this.studentService
            .getStudents()
            .subscribe(students => {
                this.students = students;
            });
    }

    getStudent(): Student {
        return this.students.find(st => st.id === this.studentSelect);
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
            .subscribe(() => {
                this.studentResponseHandler();
            });
    }

    deleteStudent(): void {
        if (!this.studentSelect) {
            return;
        }
        this.studentService
            .deleteStudentHttp(this.studentSelect)
            .subscribe(() => {
                this.studentResponseHandler();
            });
    }

    studentResponseHandler(): void {
        if (this.responseService.responseHandle()) {
            this.setStudents();
            this.newStudentReaderTicket = null;
            this.newStudentEmail = null;
            this.studentSelect = null;
            this.studentEmail = null;
            this.studentReaderTicket = null;
        }
    }

    ngOnDestroy(): void {
        this.helperService.unsubscribeHandle(this.studentsSubscription, [
            this.studentsDeleteSubscription,
            this.studentsEditSubscription,
            this.studentsFetchSubscription
        ]);
    }
}
