import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';
import { LibrariansRoutingModule } from './librarians-routing.module';

import { LibrarianScheduleComponent } from './librarian-schedule/librarian-schedule.component';
import { LibrariansComponent } from './librarians/librarians.component';
import { LibrarianDetailsComponent } from './librarian-details/librarian-details.component';
import { LoansSectionComponent } from './librarian-details/loans-section/loans-section.component';
import { StudentsModule } from '../students/students.module';
import { ScheduleSectionComponent } from './librarian-details/schedule-section/schedule-section.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { ScheduleComponent } from './schedule/schedule.component';
import { NgxsModule } from '@ngxs/store';
import { LibrarianState } from '../../store/state/librarian.state';

@NgModule({
    declarations: [
        LibrarianScheduleComponent,
        LibrariansComponent,
        LibrarianDetailsComponent,
        LoansSectionComponent,
        ScheduleSectionComponent,
        ScheduleComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule, LibrariansRoutingModule, StudentsModule, CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        NgxsModule.forFeature([LibrarianState])
    ]
})
export class LibrariansModule {}
