import { Action, Selector, State, StateContext } from '@ngxs/store';
import { User } from '../../models/user.model';
import { Injectable } from '@angular/core';
import { StudentStateModel } from '../models/student.model';
import { StudentService } from '../../services/student.service';
import { tap } from 'rxjs/operators';


/*********************************
 *** UserActions - Commands ***
 **********************************/
export class InitStudentState {
    static readonly type = '[Student] InitStudentState';
}

export class LoadStudent {
    static readonly type = '[Student] LoadStudent';

    constructor(public id: string) {}
}

export class LoadStudents {
    static readonly type = '[Student] LoadStudents';

    constructor(
        public filterValue: string = '',
        public sortName: string = 'name',
        public sortOrder = 'asc',
        public pageNumber = 0,
        public pageSize = 5
    ) {}
}

/*******************************
 *** UserState            ***
 ********************************/
export const STATE_NAME = 'student';

@State<StudentStateModel>({
    name: STATE_NAME,
    defaults: new StudentStateModel()
})

@Injectable()
export class StudentState {
    constructor(private studentService: StudentService) { }

    /****************
     *** Selectors ***
     *****************/
    @Selector()
    static Student(state: StudentStateModel): User {
        return state.student;
    }

    @Selector()
    static Students(state: StudentStateModel): User[] {
        return state.students;
    }

    @Selector()
    static StudentsTotalItems(state: StudentStateModel): number {
        return state.studentsTotalItems;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitStudentState)
    initUserState(ctx: StateContext<StudentStateModel>) {
        return ctx.setState(new StudentStateModel());
    }

    @Action(LoadStudent)
    loadStudent(ctx: StateContext<StudentStateModel>, action: LoadStudent) {
        return this.studentService.getStudent(action.id).pipe(tap(res => ctx.patchState({ student: res.student })));
    }

    @Action(LoadStudents)
    loadStudents(ctx: StateContext<StudentStateModel>, action: LoadStudents) {
        const { pageSize, pageNumber, filterValue, sortOrder, sortName } = action;
        return this.studentService.getStudents(filterValue, sortName, sortOrder, pageNumber, pageSize).pipe(tap(res => {
            ctx.patchState({ students: res.students, studentsTotalItems: res.quantity });
        }));
    }
}
