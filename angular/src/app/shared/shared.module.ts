import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

import { MatRadioModule, MatSnackBarModule } from '@angular/material';
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

import { ImageCropperModule } from 'ngx-image-cropper';

import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { DiscardChangesModalComponent } from './discard-changes-modal/discard-changes-modal.component';

import { CanDeactivateGuard } from './services/can-deactivate-guard.service';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

import { MatPaginatorModule, MatSortModule } from '@angular/material';

import { LineChartModule } from '@swimlane/ngx-charts';


@NgModule({
    declarations: [LoadingSpinnerComponent, DiscardChangesModalComponent],
    imports: [CommonModule],
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
        LoadingSpinnerComponent,
        ReactiveFormsModule,
        OwlNativeDateTimeModule,
        OwlDateTimeModule,
        LayoutModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatTableModule,
        BrowserAnimationsModule,
        MatSortModule,
        MatPaginatorModule,
        MatTabsModule,
        LineChartModule
    ],
    providers: [CanDeactivateGuard],
    entryComponents: [DiscardChangesModalComponent]
})
export class SharedModule {}
