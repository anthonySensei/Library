import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { UserStateModel } from './user.model';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularLinks } from '../constants/angularLinks';
import { MaterialService } from '../services/material.service';
import { Injectable } from '@angular/core';
import { SnackBarClasses } from '../constants/snackBarClasses';
import { UpdateUserPayload } from '../models/request/user';
import { UserService } from '../services/user.service';
import { StudentStateModel } from './student.model';


/*********************************
 *** UserActions - Commands ***
 **********************************/
export class InitUserState {
    static readonly type = '[User] InitUserState';
}

export class Login {
    static readonly type = '[User] Login';

    constructor(public email: string, public password: string) {}
}

export class AutoLogin {
    static readonly type = '[User] AutoLogin';

    constructor() {}
}

export class Logout {
    static readonly type = '[User] Logout';

    constructor() {}
}

export class AutoLogout {
    static readonly type = '[User] AutoLogout';

    constructor(public expirationDuration: number) {}
}

export class RegisterUser {
    static readonly type = '[User] RegisterUser';

    constructor(public name: string, public email: string, public password: string) {}
}

export class SetUser {
    static readonly type = '[User] SetUser';

    constructor(public user: User) {}
}

export class CreateUser {
    static readonly type = '[User] CreateUser';

    constructor(public data: UpdateUserPayload) {}
}

export class EditUser {
    static readonly type = '[User] EditUser';

    constructor(public data: UpdateUserPayload, public userId?: string) {}
}

export class DeleteUser {
    static readonly type = '[Student] DeleteStudent';

    constructor(public id?: string) {}
}

/*******************************
 *** UserState            ***
 ********************************/
export const CONTRACT_STATE_NAME = 'user';

@State<UserStateModel>({
    name: CONTRACT_STATE_NAME,
    defaults: new UserStateModel()
})

@Injectable()
export class UserState {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private materialService: MaterialService,
        private router: Router,
    ) { }

    /****************
     *** Selectors ***
     *****************/
    @Selector()
    static User(state: UserStateModel): User {
        return state.user;
    }

    /****************
     *** Resolvers ***
     *****************/
    @Action(InitUserState)
    initUserState(ctx: StateContext<UserStateModel>) {
        ctx.setState(new UserStateModel());
        return ctx;
    }

    @Action(SetUser)
    setUser(ctx: StateContext<UserStateModel>, action: SetUser) {
        return ctx.patchState({ user: action.user });
    }

    @Action(Login)
    login(ctx: StateContext<UserStateModel>, action: Login) {
        const { email, password } = action;
        return this.authService.login(email, password).pipe(tap(async response => {
            const { success, token, user, tokenExpiresIn, message } = response;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
                return ctx;
            }

            this.authService.setJwtToken(token);
            const expirationDate = new Date(new Date().getTime() + tokenExpiresIn * 1000);
            const tokenData = { token, expirationDate };
            ctx.dispatch(new AutoLogout(tokenExpiresIn * 1000));
            localStorage.setItem('tokenData', JSON.stringify(tokenData));
            localStorage.setItem('userData', JSON.stringify(user));
            ctx.dispatch(new SetUser(user));
            await this.router.navigate([AngularLinks.HOME]);
        }));
    }

    @Action(AutoLogin)
    autoLogin(ctx: StateContext<UserStateModel>) {
        const user = JSON.parse(localStorage.getItem('userData'));
        const tokenData: { token: string; expirationDate: string; } = JSON.parse(localStorage.getItem('tokenData'));

        if (!user) {
            return;
        }

        if (!tokenData) {
            return;
        }

        if (tokenData.token) {
            ctx.dispatch(new SetUser(user));
            this.authService.setJwtToken(tokenData.token);
            const expirationDuration = new Date(tokenData.expirationDate).getTime() - new Date().getTime();
            return ctx.dispatch(new AutoLogout(expirationDuration));
        }

        return ctx.dispatch(new Logout());
    }

    @Action(RegisterUser)
    registerUser(ctx: StateContext<UserStateModel>, action: RegisterUser) {
        const { name, email, password } = action;
        return this.authService.createUser(name, email, password).pipe(tap(async response => {
            const { success, message } = response;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
                return ctx;
            }

            this.materialService.openSnackbar(message, SnackBarClasses.Success);
            await this.router.navigate([AngularLinks.LOGIN]);
        }));
    }

    @Action(CreateUser)
    createUser(ctx: StateContext<UserStateModel>, action: CreateUser) {
        const { data } = action;
        return this.userService.createUser(data).pipe(tap(async response => {
            const { success, message } = response;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
                return ctx;
            }

            this.materialService.openSnackbar(message, SnackBarClasses.Success);
        }));
    }

    @Action(EditUser)
    editUser(ctx: StateContext<UserStateModel>, action: EditUser) {
        const { data, userId } = action;
        const { id: currentUserId } = ctx.getState().user;
        const id = userId || currentUserId;
        return this.userService.editUser({ id, body: data }).pipe(tap(async response => {
            const { success, message } = response;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
                return ctx;
            }

            this.materialService.openSnackbar(message, SnackBarClasses.Success);
        }));
    }

    @Action(DeleteUser)
    deleteStudent(ctx: StateContext<StudentStateModel>, action: DeleteUser) {
        const { id } = action;
        return this.userService.deleteUser(id).pipe(tap((response: any) => {
            const { success, message } = response;

            if (!success) {
                this.materialService.openErrorSnackbar(message);
                return;
            }

            this.materialService.openSnackbar(message, SnackBarClasses.Success);
        }));
    }

    @Action(Logout)
    logout(ctx: StateContext<UserStateModel>) {
        return this.authService.logout().pipe(tap(async () => {
            ctx.dispatch(new SetUser(null));
            this.authService.setJwtToken(null);
            localStorage.clear();
            await this.router.navigate([AngularLinks.LOGIN]);
            return ctx;
        }));
    }

    @Action(AutoLogout)
    AutoLogout(ctx: StateContext<UserStateModel>, action: AutoLogout) {
        const { expirationDuration } = action;

        if (expirationDuration < 0) {
            ctx.dispatch(new Logout());
            localStorage.clear();
            return;
        }

        setTimeout(() => {
            ctx.dispatch(new Logout());
        }, expirationDuration);

        return ctx;
    }
}
