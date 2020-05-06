import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './components/login/auth.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ActivationPageComponent } from './components/activation-page/activation-page.component';

const routes: Routes = [
    { path: 'login', component: AuthComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'activation-page', component: ActivationPageComponent }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {}
