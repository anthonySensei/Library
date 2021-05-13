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

export class SetStudent {
    static readonly type = '[Student] SetStudent';

    constructor(public student: User) {}
}

export class SetStudents {
    static readonly type = '[Student] SetStudents';

    constructor(public students: User[]) {}
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

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitStudentState)
    initUserState(ctx: StateContext<StudentStateModel>) {
        return ctx.setState(new StudentStateModel());
    }

    @Action(LoadStudent)
    loadStudent(ctx: StateContext<StudentStateModel>, action: LoadStudent) {
        return this.studentService.getStudent(action.id).pipe(tap(res => ctx.dispatch(new SetStudent(res.student))));
    }

    @Action(LoadStudents)
    loadStudents(ctx: StateContext<StudentStateModel>, action: LoadStudents) {
        const { pageSize, pageNumber, filterValue, sortOrder, sortName } = action;
        return this.studentService.getStudents(filterValue, sortName, sortOrder, pageNumber, pageSize).pipe(tap(res => {
            ctx.dispatch(new SetStudents(res.students));
        }));
    }

    @Action(SetStudent)
    setStudent(ctx: StateContext<StudentStateModel>, action: SetStudent) {
        return ctx.patchState({ student: action.student });
    }

    @Action(SetStudents)
    setStudents(ctx: StateContext<StudentStateModel>, action: SetStudents) {
        return ctx.patchState({ students: action.students });
    }
}
