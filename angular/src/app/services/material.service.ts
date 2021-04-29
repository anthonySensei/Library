import { Injectable } from '@angular/core';

import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from 'rxjs';

import { DiscardChangesModalComponent } from '../shared/discard-changes-modal/discard-changes-modal.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SnackBarClasses } from '../constants/snackBarClasses';

@Injectable({
    providedIn: 'root'
})
export class MaterialService {
    private changeDiscardModalWidth = '25%';
    private snackbarDuration = 3000;

    constructor(
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private breakpointObserver: BreakpointObserver
    ) {
        breakpointObserver
            .observe([Breakpoints.Small, Breakpoints.XSmall])
            .subscribe(result => {
                if (result.matches) {
                    this.changeDiscardModalWidth = '95%';
                }
            });
        breakpointObserver
            .observe([Breakpoints.Medium, Breakpoints.Tablet])
            .subscribe(result => {
                if (result.matches) {
                    this.changeDiscardModalWidth = '85%';
                }
            });
    }

    public openSnackbar(
        message: string,
        snackBarClass: string
    ): void {
        const config = new MatSnackBarConfig();
        config.panelClass = [snackBarClass];
        config.duration = this.snackbarDuration;
        this.snackBar.open(message || 'Completed', null, config);
    }

    public openErrorSnackbar(
        message: string
    ): void {
        const config = new MatSnackBarConfig();
        config.panelClass = [SnackBarClasses.Danger];
        config.duration = 4000;
        this.snackBar.open(message, null, config);
    }

    openDiscardChangesDialog(
        discard: boolean,
        discardChanged: Subject<boolean>
    ): void {
        const dialogRef = this.dialog.open(DiscardChangesModalComponent, {
            width: this.changeDiscardModalWidth
        });

        dialogRef.afterClosed().subscribe(result => {
            discard = result;
            discardChanged.next(discard);
        });
    }
}
