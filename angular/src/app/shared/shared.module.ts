import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

import {
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSnackBarModule,
    MatSortModule
} from '@angular/material';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ImageCropperModule } from 'ngx-image-cropper';

import { DiscardChangesModalComponent } from './discard-changes-modal/discard-changes-modal.component';

import { CanDeactivateGuard } from './can-deactivate-guard.service';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

import { LineChartModule } from '@swimlane/ngx-charts';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ChartSectionComponent } from './chart-section/chart-section.component';
import { ConfirmDeleteModalComponent } from './confirm-delete-modal/confirm-delete-modal.component';
import { SmallScreenComponent } from './small-screen/small-screen.component';

@NgModule({
    declarations: [
        DiscardChangesModalComponent,
        ChartSectionComponent,
        ConfirmDeleteModalComponent,
        SmallScreenComponent
    ],
    imports: [CommonModule, LineChartModule],
    exports: [
        CommonModule,
        MatMenuModule,
        MatToolbarModule,
        MatDividerModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatGridListModule,
        MatInputModule,
        MatDialogModule,
        MatSelectModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatRadioModule,
        ImageCropperModule,
        ReactiveFormsModule,
        OwlNativeDateTimeModule,
        OwlDateTimeModule,
        LayoutModule,
        MatToolbarModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatTableModule,
        BrowserAnimationsModule,
        MatSortModule,
        MatPaginatorModule,
        MatTabsModule,
        LineChartModule,
        MatStepperModule,
        MatExpansionModule,
        NgxMaterialTimepickerModule,
        MatCardModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        ChartSectionComponent,
        SmallScreenComponent
    ],
    providers: [CanDeactivateGuard],
    entryComponents: [DiscardChangesModalComponent, ConfirmDeleteModalComponent]
})
export class SharedModule {}
