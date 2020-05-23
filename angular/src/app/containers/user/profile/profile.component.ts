import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { MatDialog } from '@angular/material/dialog';

import { Observable, Subject, Subscription } from 'rxjs';

import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { MaterialService } from '../../../services/material.service';
import { ResponseService } from '../../../services/response.service';

import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { ChangedDataProfile } from '../../../constants/changedDataProfile';

import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { ChangeProfileImageModalComponent } from './change-profile-image/change-profile-image-modal.component';

import { User } from '../../../models/user.model';
import { Response } from '../../../models/response.model';

@Component({
    selector: 'app-user',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit, OnDestroy {
    profileForm: FormGroup;

    isLoading: boolean;
    discard: boolean;
    discardChanged = new Subject<boolean>();

    user: User;

    updateProfileImage: Subscription;
    updateUserDataSubscription: Subscription;
    userSubscription: Subscription;
    breakPointSmallSubscription: Subscription;
    breakPointMediumSubscription: Subscription;
    breakPointLargeSubscription: Subscription;
    changeImageDialogSubscription: Subscription;
    changePasswordDialogSubscription: Subscription;

    error: string;

    oldPassword: string;
    newPassword: string;
    retypeNewPassword: string;

    response: Response;

    snackbarDuration = 5000;

    emailValidation;

    changePasswordModalWidth = '35%';
    changePictureModal = '40%';

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private responseService: ResponseService,
        public dialog: MatDialog,
        private materialService: MaterialService,
        private validationService: ValidationService,
        private breakpointObserver: BreakpointObserver
    ) {
        this.breakPointSmallSubscription = breakpointObserver
            .observe([Breakpoints.Small, Breakpoints.XSmall])
            .subscribe(result => {
                if (result.matches) {
                    this.changePasswordModalWidth = '95%';
                    this.changePictureModal = '95%';
                }
            });
        this.breakPointMediumSubscription = breakpointObserver
            .observe([Breakpoints.Medium, Breakpoints.Tablet])
            .subscribe(result => {
                if (result.matches) {
                    this.changePasswordModalWidth = '75%';
                    this.changePictureModal = '85%';
                }
            });
        this.breakPointLargeSubscription = breakpointObserver
            .observe([Breakpoints.Large, Breakpoints.XLarge])
            .subscribe(result => {
                if (result.matches) {
                    this.changePasswordModalWidth = '35%';
                    this.changePictureModal = '40%';
                }
            });
    }

    ngOnInit(): void {
        document.title = 'Profile';
        this.isLoading = true;
        this.emailValidation = this.validationService.getEmailValidation();
        this.userHandle();
        this.initializeForm();
    }

    initializeForm(): void {
        this.profileForm = new FormGroup({
            email: new FormControl(this.user.email, [
                Validators.required,
                Validators.email,
                Validators.pattern(this.emailValidation)
            ]),
            name: new FormControl(this.user.name, [Validators.required])
        });
    }

    userHandle(): void {
        this.userSubscription = this.authService
            .getUser()
            .subscribe((user: User) => {
                this.user = user;
            });
        this.isLoading = false;
    }

    hasError(controlName: string, errorName: string): boolean {
        return this.profileForm.controls[controlName].hasError(errorName);
    }

    openChangeProfileImageDialog(): void {
        const dialogRef = this.dialog.open(ChangeProfileImageModalComponent, {
            width: this.changePictureModal,
            data: {
                imageBase64: ''
            }
        });

        this.changeImageDialogSubscription = dialogRef
            .afterClosed()
            .subscribe((profileImage: string) => {
                if (profileImage) {
                    this.updateUserDataSubscription = this.userService
                        .updateUserDataHttp(
                            { ...this.user, profileImage },
                            ChangedDataProfile.IMAGE
                        )
                        .subscribe(() => {
                            this.response = this.responseService.getResponse();
                            if (this.response.isSuccessful) {
                                this.user.profileImage = profileImage;
                                localStorage.setItem(
                                    'userData',
                                    JSON.stringify(this.user)
                                );
                                this.openSnackBar(
                                    this.response.message,
                                    SnackBarClasses.Success,
                                    this.snackbarDuration
                                );
                            } else {
                                this.openSnackBar(
                                    this.response.message,
                                    SnackBarClasses.Danger,
                                    this.snackbarDuration
                                );
                            }
                        });
                } else {
                    this.openSnackBar(
                        'Image was not selected',
                        SnackBarClasses.Warn,
                        this.snackbarDuration
                    );
                }
            });
    }

    openChangePasswordDialog(): void {
        const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
            width: this.changePasswordModalWidth,
            data: {
                user: this.user
            }
        });

        this.changePasswordDialogSubscription = dialogRef
            .afterClosed()
            .subscribe();
    }

    onChangeUserData(): void {
        const email = this.profileForm.value.email;
        const name = this.profileForm.value.name;

        if (!email || !name) {
            this.error = 'Please fill in all fields';
            return;
        }

        if (this.user.name === name && this.user.email === email) {
            this.openSnackBar(
                'Nothing to change',
                SnackBarClasses.Warn,
                this.snackbarDuration
            );
            return;
        }

        this.updateUserDataSubscription = this.userService
            .updateUserDataHttp(
                { ...this.user, email, name },
                ChangedDataProfile.INFO
            )
            .subscribe(() => {
                this.response = this.responseService.getResponse();
                if (this.response.isSuccessful) {
                    this.user.email = email;
                    this.user.name = name;
                    localStorage.setItem('userData', JSON.stringify(this.user));
                    this.openSnackBar(
                        this.response.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                } else {
                    if (this.response.message.toLowerCase().includes('email')) {
                        this.error = this.response.message;
                        this.profileForm.controls.email.setErrors({
                            incorrect: true
                        });
                    } else {
                        this.openSnackBar(
                            this.response.message,
                            SnackBarClasses.Danger,
                            this.snackbarDuration
                        );
                    }
                }
            });
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.profileForm.touched) {
            this.materialService.openDiscardChangesDialog(
                this.discard,
                this.discardChanged
            );
            return this.discardChanged;
        } else {
            return true;
        }
    }

    openSnackBar(message: string, style: string, duration: number): void {
        this.materialService.openSnackBar(message, style, duration);
    }

    ngOnDestroy(): void {
        this.breakPointLargeSubscription.add(this.breakPointSmallSubscription);
        this.breakPointLargeSubscription.add(this.breakPointMediumSubscription);
        this.breakPointLargeSubscription.add(this.updateProfileImage);
        this.breakPointLargeSubscription.add(
            this.changeImageDialogSubscription
        );
        this.breakPointLargeSubscription.add(
            this.changePasswordDialogSubscription
        );
        this.breakPointLargeSubscription.add(this.updateUserDataSubscription);
        this.breakPointLargeSubscription.unsubscribe();
    }
}
