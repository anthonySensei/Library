import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Student } from '../models/student.model';

import { StudentService } from '../services/student.service';

export class StudentsDataSource implements DataSource<Student> {
    private studentSubject = new BehaviorSubject<Student[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private studentService: StudentService) {}

    loadStudents(
        filterName: string,
        filterValue: string,
        sortOrder: string,
        pageIndex: number,
        pageSize: number
    ) {
        this.loadingSubject.next(true);

        this.studentService
            .getStudentsHttp(
                filterName,
                filterValue,
                sortOrder,
                pageIndex,
                pageSize
            )
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((students: Student[]) => this.studentSubject.next(students));
    }

    connect(collectionViewer: CollectionViewer): Observable<Student[]> {
        return this.studentSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.studentSubject.complete();
        this.loadingSubject.complete();
    }
}
