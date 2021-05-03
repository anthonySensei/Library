import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Select, Store } from '@ngxs/store';

import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { Department } from '../../../models/department.model';
import { StudentService } from '../../../services/student.service';

import { HelperService } from '../../../services/helper.service';
import { PageTitles } from '../../../constants/pageTitles';
import { User } from '../../../models/user.model';
import { LoadStudent, StudentState } from '../../../store/state/student.state';

@Component({
    selector: 'app-user-details',
    templateUrl: './student-details.component.html',
    styleUrls: ['./student-details.component.sass']
})
export class StudentDetailsComponent implements OnInit, OnDestroy {
    isLoading: boolean;
    departments: Department[];

    @Select(StudentState.Student)
    student$: Observable<User>;

    constructor(
        private studentService: StudentService,
        public helperService: HelperService,
        private route: ActivatedRoute,
        private store: Store
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.STUDENT_DETAILS;
        this.isLoading = true;
        this.route.params.pipe(untilDestroyed(this)).subscribe(
            (params: Params) => {
                this.store.dispatch(new LoadStudent(params.id)).pipe(untilDestroyed(this)).subscribe(() => this.isLoading = false);
            }
        );
    }

    ngOnDestroy(): void {}
}
