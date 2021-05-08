import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { MaterialService } from '../../services/material.service';
import { Injectable } from '@angular/core';
import { SnackBarClasses } from '../../constants/snackBarClasses';
import { StudentStateModel } from '../models/student.model';
import { DepartmentStateModel } from '../models/department.model';
import { Department } from '../../models/department.model';
import { UpdateDepartmentPayload } from '../../models/request/department';
import { DepartmentService } from '../../services/department.service';


/*********************************
 *** AuthorActions - Commands ***
 **********************************/
export class InitDepartmentState {
    static readonly type = '[Department] InitDepartmentState';
}

export class LoadDepartments {
    static readonly type = '[Department] LoadDepartments';

    constructor() {}
}

export class SetDepartments {
    static readonly type = '[Department] SetDepartments';

    constructor(public departments: Department[]) {}
}

export class CreateDepartment {
    static readonly type = '[Department] CreateDepartment';

    constructor(public data: UpdateDepartmentPayload) {}
}

export class EditDepartment {
    static readonly type = '[Department] EditDepartment';

    constructor(public id: string, public data: UpdateDepartmentPayload) {}
}

export class DeleteDepartment {
    static readonly type = '[Department] DeleteDepartment';

    constructor(public id: string) {}
}

/*******************************
 *** AuthorState            ***
 ********************************/
export const STATE_NAME = 'department';

@State<DepartmentStateModel>({
    name: STATE_NAME,
    defaults: new DepartmentStateModel()
})

@Injectable()
export class DepartmentState {
    constructor(
        private departmentService: DepartmentService,
        private materialService: MaterialService
    ) { }

    /****************
     *** Selectors ***
     *****************/
    @Selector()
    static Departments(state: DepartmentStateModel): Department[] {
        return state.departments;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitDepartmentState)
    initAuthorState(ctx: StateContext<DepartmentStateModel>) {
        ctx.setState(new DepartmentStateModel());
        return ctx;
    }

    @Action(LoadDepartments)
    loadAuthors(ctx: StateContext<DepartmentStateModel>) {
        return this.departmentService.getDepartments().pipe(tap(response => {
            ctx.dispatch(new SetDepartments(response.departments));
        }));
    }

    @Action(SetDepartments)
    setAuthor(ctx: StateContext<DepartmentStateModel>, action: SetDepartments) {
        return ctx.patchState({ departments: action.departments });
    }

    @Action(CreateDepartment)
    createAuthor(ctx: StateContext<DepartmentStateModel>, action: CreateDepartment) {
        return this.departmentService.createDepartment(action.data).pipe(tap(response => {
            const { message } = response;
            this.materialService.openSnackbar(message, SnackBarClasses.Success);
            ctx.dispatch(new LoadDepartments());
        }));
    }

    @Action(EditDepartment)
    editAuthor(ctx: StateContext<DepartmentStateModel>, action: EditDepartment) {
        const { id, data } = action;
        return this.departmentService.editDepartment({ id, department: data }).pipe(tap(response => {
            const { message } = response;
            this.materialService.openSnackbar(message, SnackBarClasses.Success);
            ctx.dispatch(new LoadDepartments());
        }));
    }

    @Action(DeleteDepartment)
    deleteAuthor(ctx: StateContext<StudentStateModel>, action: DeleteDepartment) {
        const { id } = action;
        return this.departmentService.deleteDepartment(id).pipe(tap((response: any) => {
            const { message } = response;
            this.materialService.openSnackbar(message, SnackBarClasses.Success);
            ctx.dispatch(new LoadDepartments());
        }));
    }
}
