import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../guards/auth.guard';

import { ProfileComponent } from './profile/profile.component';

import { CanDeactivateGuard } from '@shared/can-deactivate-guard.service';

import { AngularLinks } from '../../constants/angularLinks';

const routes: Routes = [
    {
        path: AngularLinks.MY_ACCOUNT,
        canDeactivate: [CanDeactivateGuard],
        component: ProfileComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule {}
