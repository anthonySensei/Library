import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';

import { AuthComponent } from './login/auth.component';
import { RegistrationComponent } from './registration/registration.component';
import { ActivationPageComponent } from './activation-page/activation-page.component';
import { NgxsModule } from '@ngxs/store';
import { UserState } from '../../store/user.state';

@NgModule({
    declarations: [
        AuthComponent,
        RegistrationComponent,
        ActivationPageComponent,
    ],
    imports: [
        SharedModule,
        RouterModule,
        AuthRoutingModule,
        FormsModule,
        NgxsModule.forFeature([UserState]),
    ]
})
export class AuthModule {}
