import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';
import { ManagerGuard } from './manager.guard';

import { UserComponent } from './user.component';
import { CreateUserComponent } from './create-user/create-user.component';

import { CanDeactivateGuard } from '../shared/can-deactivate-guard.service';
import { angularLinks } from '../constants/angularLinks';

const routes: Routes = [
    {
        path: angularLinks.MY_ACCOUNT,
        canDeactivate: [CanDeactivateGuard],
        component: UserComponent,
        canActivate: [AuthGuard]
    },
    {
        path: angularLinks.CREATE_USER,
        canDeactivate: [CanDeactivateGuard],
        component: CreateUserComponent,
        canActivate: [AuthGuard, ManagerGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule {}
