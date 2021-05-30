import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Select, Store } from '@ngxs/store';

import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { StudentService } from '../../../services/student.service';

import { PageTitles } from '../../../constants/pageTitles';
import { User } from '../../../models/user.model';
import { LoadStudent, StudentState } from '../../../store/state/student.state';
import { LoadStatistic } from '../../../store/state/book.state';

@Component({
    selector: 'app-user-details',
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy {
    isLoading: boolean;

    @Select(StudentState.Student)
    student$: Observable<User>;

    constructor(
        private studentService: StudentService,
        private route: ActivatedRoute,
        private store: Store
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.STUDENT_DETAILS;
        this.isLoading = true;
        this.route.params.pipe(untilDestroyed(this)).subscribe((params: Params) => {
            this.store.dispatch(new LoadStudent(params.id));
            this.getUser$();
        });
    }

    getUser$() {
        this.student$.pipe(untilDestroyed(this)).subscribe(user => {
            if (!user) {
                return;
            }

            this.isLoading = false;
            this.store.dispatch(new LoadStatistic('user', user.email));
        });
    }

    ngOnDestroy(): void {}
}
