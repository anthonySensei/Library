import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { StudentsRoutingModule } from './students-routing.module';

import { StudentsComponent } from './students/students.component';
import { StudentDetailsComponent } from './student-details/student-details.component';
import { OrdersComponent } from './orders/orders.component';
import { AddStudentComponent } from './add-student/add-student.component';


@NgModule({
    declarations: [
        StudentsComponent,
        StudentDetailsComponent,
        OrdersComponent,
        AddStudentComponent
    ],
    imports: [CommonModule, FormsModule, SharedModule, StudentsRoutingModule]
})
export class StudentsModule {}
