import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';

import { UserComponent } from './components/profile/user.component';
import { AddLibrarianComponent } from './components/add-librarian/add-librarian.component';
import { ChangePasswordModalComponent } from './components/profile/change-password-modal/change-password-modal.component';
import { ChangeProfileImageModalComponent } from './components/profile/change-profile-image/change-profile-image-modal.component';
import { StudentsComponent } from './components/students/students.component';
import { StudentDetailsComponent } from './components/student-details/student-details.component';
import { LibrarianScheduleComponent } from './components/librarian-schedule/librarian-schedule.component';
import { LibrariansComponent } from './components/librarians/librarians.component';
import { LibrarianDetailsComponent } from './components/librarian-details/librarian-details.component';

@NgModule({
    declarations: [
        UserComponent,
        ChangePasswordModalComponent,
        ChangeProfileImageModalComponent,
        AddLibrarianComponent,
        StudentsComponent,
        StudentDetailsComponent,
        LibrarianScheduleComponent,
        LibrariansComponent,
        LibrarianDetailsComponent
    ],
    imports: [CommonModule, FormsModule, SharedModule, UsersRoutingModule],
    entryComponents: [
        ChangePasswordModalComponent,
        ChangeProfileImageModalComponent
    ]
})
export class UsersModule {}
