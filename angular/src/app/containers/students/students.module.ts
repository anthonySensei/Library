import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';
import { StudentsRoutingModule } from './students-routing.module';

import { StudentsComponent } from './students/students.component';
import { StudentDetailsComponent } from './student-details/student-details.component';
import { OrdersComponent } from './orders/orders.component';
import { LoanSectionComponent } from './student-details/loan-section/loan-section.component';
import { OrdersSectionComponent } from './student-details/orders-section/orders-section.component';
import { NgxsModule } from '@ngxs/store';
import { StudentState } from '../../store/student.state';

@NgModule({
    declarations: [
        StudentsComponent,
        StudentDetailsComponent,
        OrdersComponent,
        LoanSectionComponent,
        OrdersSectionComponent,
    ],
    exports: [
        LoanSectionComponent,
    ],
    imports: [CommonModule, FormsModule, SharedModule, StudentsRoutingModule, NgxsModule.forFeature([StudentState])]
})
export class StudentsModule {}
