import { Action, Selector, State, StateContext } from '@ngxs/store';
import { User } from '../models/user.model';
import { Injectable } from '@angular/core';
import { StudentStateModel } from './student.model';
import { StudentService } from '../services/student.service';
import { tap } from 'rxjs/operators';
import { MaterialService } from '../services/material.service';
import { SnackBarClasses } from '../constants/snackBarClasses';


/*********************************
 *** UserActions - Commands ***
 **********************************/
export class InitStudentState {
    static readonly type = '[Student] InitStudentState';
}

export class LoadStudents {
    static readonly type = '[Student] GetStudents';

    constructor(
        public filterName: string = '',
        public filterValue: string = '',
        public sortOrder = 'asc',
        public pageNumber = 0,
        public pageSize = 5
    ) {}
}

export class SetStudents {
    static readonly type = '[Student] SetStudents';

    constructor(public students: User[]) {}
}

export class SetStudent {
    static readonly type = '[Student] SetStudent';

    constructor(public student: User) {}
}

export class DeleteStudent {
    static readonly type = '[Student] DeleteStudent';

    constructor(public studentId?: string) {}
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
    static Students(state: StudentStateModel): User[] {
        return state.students;
    }

    @Selector()
    static Student(state: StudentStateModel): User {
        return state.student;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitStudentState)
    initUserState(ctx: StateContext<StudentStateModel>) {
        ctx.setState(new StudentStateModel());
        return ctx;
    }

    @Action(LoadStudents)
    loadStudents(ctx: StateContext<StudentStateModel>, action: LoadStudents) {
        const { pageSize, pageNumber, filterName, filterValue, sortOrder } = action;
        return this.studentService.getStudents(filterName, filterValue, sortOrder, pageNumber, pageSize).pipe(tap(res => {
            const { success, students, message } = res;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
            }

            ctx.dispatch(new SetStudents(students));
        }));
    }

    @Action(SetStudents)
    setStudents(ctx: StateContext<StudentStateModel>, action: SetStudents) {
        const { students } = action;
        return ctx.patchState({ students });
    }

    @Action(SetStudent)
    setStudent(ctx: StateContext<StudentStateModel>, action: SetStudent) {
        const { student } = action;
        return ctx.patchState({ student });
    }

    @Action(DeleteStudent)
    deleteStudent(ctx: StateContext<StudentStateModel>, action: DeleteStudent) {
        const { studentId } = action;
        const { id: selectedStudentId } = ctx.getState().student;
        const id = studentId || selectedStudentId;
        return this.studentService.deleteStudent(id).pipe(tap((response: any) => {
            const { success, message } = response;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
                return;
            }

            this.materialService.openSnackbar(message, SnackBarClasses.Success);
            ctx.patchState({ student: null});
        }));
    }
}
