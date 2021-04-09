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
import { ScheduleSectionComponent } from './librarian-details/schedule-section/schedule-section.component';
import { PersonalInfoSectionComponent } from './librarian-details/personal-info-section/personal-info-section.component';
import { ScheduleFilterSectionComponent } from './librarian-schedule/schedule-filter-section/schedule-filter-section.component';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import * as moment from 'moment';
import { CalendarModule, DateAdapter } from 'angular-calendar';

export function momentAdapterFactory() {
    return adapterFactory(moment);
}

@NgModule({
    declarations: [
        AddLibrarianComponent,
        LibrarianScheduleComponent,
        LibrariansComponent,
        LibrarianDetailsComponent,
        LoansSectionComponent,
        ScheduleSectionComponent,
        PersonalInfoSectionComponent,
        ScheduleFilterSectionComponent
    ],
    imports: [CommonModule, FormsModule, SharedModule, LibrariansRoutingModule, StudentsModule, CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: momentAdapterFactory
    })]
})
export class LibrariansModule {
}
