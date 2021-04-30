import { Action, Selector, State, StateContext } from '@ngxs/store';
import { User } from '../models/user.model';
import { Injectable } from '@angular/core';
import { StudentStateModel } from './student.model';
import { StudentService } from '../services/student.service';
import { tap } from 'rxjs/operators';
import { MaterialService } from '../services/material.service';


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
export const CONTRACT_STATE_NAME = 'student';

@State<StudentStateModel>({
    name: CONTRACT_STATE_NAME,
    defaults: new StudentStateModel()
})

@Injectable()
export class StudentState {
    constructor(
        private studentService: StudentService,
        private materialService: MaterialService
    ) { }

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
        ctx.setState(new StudentStateModel());
        return ctx;
    }

    @Action(LoadStudent)
    loadStudent(ctx: StateContext<StudentStateModel>, action: LoadStudent) {
        const { id } = action;
        return this.studentService.getStudent(id).pipe(tap(res => {
            const { success, student, message } = res;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
            }

            ctx.dispatch(new SetStudent(student));
        }));
    }

    @Action(LoadStudents)
    loadStudents(ctx: StateContext<StudentStateModel>, action: LoadStudents) {
        const { pageSize, pageNumber, filterValue, sortOrder } = action;
        return this.studentService.getStudents(filterValue, sortOrder, pageNumber, pageSize).pipe(tap(res => {
            const { success, students, message } = res;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
            }

            ctx.dispatch(new SetStudents(students));
        }));
    }

    @Action(SetStudent)
    setStudent(ctx: StateContext<StudentStateModel>, action: SetStudent) {
        const { student } = action;
        return ctx.patchState({ student });
    }

    @Action(SetStudents)
    setStudents(ctx: StateContext<StudentStateModel>, action: SetStudents) {
        const { students } = action;
        return ctx.patchState({ students });
    }
}
