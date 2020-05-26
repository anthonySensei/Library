import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { LibrariansRoutingModule } from './librarians-routing.module';

import { AddLibrarianComponent } from './add-librarian/add-librarian.component';
import { LibrarianScheduleComponent } from './librarian-schedule/librarian-schedule.component';
import { LibrariansComponent } from './librarians/librarians.component';
import { LibrarianDetailsComponent } from './librarian-details/librarian-details.component';
import { LoansSectionComponent } from './librarian-details/loans-section/loans-section.component';
import { StudentsModule } from '../students/students.module';

@NgModule({
    declarations: [
        AddLibrarianComponent,
        LibrarianScheduleComponent,
        LibrariansComponent,
        LibrarianDetailsComponent,
        LoansSectionComponent
    ],
    imports: [CommonModule, FormsModule, SharedModule, LibrariansRoutingModule, StudentsModule]
})
export class LibrariansModule {}
