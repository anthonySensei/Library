import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MaterialService } from '../../services/material.service';
import { Injectable } from '@angular/core';
import { StudentStateModel } from '../models/student.model';
import { Schedule } from '../../models/schedule.model';
import { ScheduleStateModel } from '../models/schedule.model';
import { tap } from 'rxjs/operators';
import { ScheduleService } from '../../services/schedule.service';
import { SnackBarClasses } from '../../constants/snackBarClasses';


/*********************************
 *** ScheduleActions - Commands ***
 **********************************/
export class InitScheduleState {
    static readonly type = '[Schedule] InitScheduleState';
}

export class LoadSchedules {
    static readonly type = '[Schedule] LoadSchedules';

    constructor() {}
}

export class SetSchedules {
    static readonly type = '[Schedule] SetSchedules';

    constructor(public authors: Schedule[]) {}
}

export class CreateSchedule {
    static readonly type = '[Schedule] CreateSchedule';

    constructor(public data: Schedule) {}
}

export class EditSchedule {
    static readonly type = '[Schedule] EditSchedule';

    constructor(public scheduleId: string, public data: Schedule) {}
}

export class DeleteSchedule {
    static readonly type = '[Schedule] DeleteSchedule';

    constructor(public id: string) {}
}

/*******************************
 *** ScheduleState            ***
 ********************************/
export const STATE_NAME = 'schedule';

@State<ScheduleStateModel>({
    name: STATE_NAME,
    defaults: new ScheduleStateModel()
})

@Injectable()
export class ScheduleState {
    constructor(
        private scheduleService: ScheduleService,
        private materialService: MaterialService
    ) { }

    /****************
     *** Selectors ***
     *****************/
    @Selector()
    static Schedules(state: ScheduleStateModel): Schedule[] {
        return state.schedules;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitScheduleState)
    initAuthorState(ctx: StateContext<ScheduleStateModel>) {
        return ctx.setState(new ScheduleStateModel());
    }

    @Action(LoadSchedules)
    loadAuthors(ctx: StateContext<ScheduleStateModel>) {
        return this.scheduleService.getSchedules().pipe(tap(response => ctx.patchState({ schedules: response.schedules })));
    }

    @Action(CreateSchedule)
    createAuthor(ctx: StateContext<ScheduleStateModel>, action: CreateSchedule) {
        return this.scheduleService.createSchedule(action.data).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadSchedules());
        }));
    }

    @Action(EditSchedule)
    editAuthor(ctx: StateContext<ScheduleStateModel>, action: EditSchedule) {
        const { scheduleId, data } = action;
        return this.scheduleService.editSchedule(scheduleId, data).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadSchedules());
        }));
    }

    @Action(DeleteSchedule)
    deleteAuthor(ctx: StateContext<StudentStateModel>, action: DeleteSchedule) {
        return this.scheduleService.deleteSchedule(action.id).pipe(tap(response => {
            this.materialService.openSnackbar(response.message, SnackBarClasses.Success);
            ctx.dispatch(new LoadSchedules());
        }));
    }
}
