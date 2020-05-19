import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { LibrariansRoutingModule } from './librarians-routing.module';

import { AddLibrarianComponent } from './add-librarian/add-librarian.component';
import { LibrarianScheduleComponent } from './librarian-schedule/librarian-schedule.component';
import { LibrariansComponent } from './librarians/librarians.component';
import { LibrarianDetailsComponent } from './librarian-details/librarian-details.component';

@NgModule({
    declarations: [
        AddLibrarianComponent,
        LibrarianScheduleComponent,
        LibrariansComponent,
        LibrarianDetailsComponent
    ],
    imports: [CommonModule, FormsModule, SharedModule, LibrariansRoutingModule]
})
export class LibrariansModule {}
