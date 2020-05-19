import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';

import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordModalComponent } from './profile/change-password-modal/change-password-modal.component';
import { ChangeProfileImageModalComponent } from './profile/change-profile-image/change-profile-image-modal.component';

@NgModule({
    declarations: [
        ProfileComponent,
        ChangePasswordModalComponent,
        ChangeProfileImageModalComponent
    ],
    imports: [CommonModule, FormsModule, SharedModule, UsersRoutingModule],
    entryComponents: [
        ChangePasswordModalComponent,
        ChangeProfileImageModalComponent
    ]
})
export class UsersModule {}
