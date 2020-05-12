import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { MatDialog } from '@angular/material/dialog';

import { Observable, Subject, Subscription } from 'rxjs';

import { UserService } from '../../services/user.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { MaterialService } from '../../../shared/services/material.service';

import { Student } from '../../models/student.model';

import { SnackBarClasses } from '../../../constants/snackBarClasses';

import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { ChangeProfileImageModalComponent } from './change-profile-image/change-profile-image-modal.component';
import { ResponseService } from '../../../shared/services/response.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.sass']
})
export class UserComponent implements OnInit, OnDestroy {
    profileForm: FormGroup;

    isLoading: boolean;
    isDone = false;
    discard = false;
    discardChanged = new Subject<boolean>();

    user: Student;

    updateProfileImage: Subscription;
    updateUserDataSubscription: Subscription;
    getUserSubscription: Subscription;
    responseSubscription: Subscription;

    error: string;
    message: string;

    oldPassword: string;
    newPassword: string;
    retypeNewPassword: string;

    oldName: string;
    oldEmail: string;

    response;

    profileImageBase64;

    snackbarDuration = 5000;

    emailValidation;

    changePasswordModalWidth = '35%';
    changePictureModal = '70%';

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private responseService: ResponseService,
        public dialog: MatDialog,
        private materialService: MaterialService,
        private validationService: ValidationService,
        private breakpointObserver: BreakpointObserver
    ) {
        breakpointObserver
            .observe([Breakpoints.Small, Breakpoints.XSmall])
            .subscribe(result => {
                if (result.matches) {
                    this.changePasswordModalWidth = '95%';
                    this.changePictureModal = '95%';
                }
            });
        breakpointObserver
            .observe([Breakpoints.Medium, Breakpoints.Tablet])
            .subscribe(result => {
                if (result.matches) {
                    this.changePasswordModalWidth = '75%';
                    this.changePictureModal = '85%';
                }
            });
        breakpointObserver
            .observe([Breakpoints.Large, Breakpoints.XLarge])
            .subscribe(result => {
                if (result.matches) {
                    this.changePasswordModalWidth = '35%';
                    this.changePictureModal = '70%';
                }
            });
    }

    ngOnInit() {
        document.title = 'Profile';
        this.emailValidation = this.validationService.getEmailValidation();
        this.initializeForm();
        this.isLoading = true;
        this.userHandle();
    }

    initializeForm() {
        this.profileForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email,
                Validators.pattern(this.emailValidation)
            ]),
            name: new FormControl(null, null)
        });
    }

    userHandle() {
        this.getUserSubscription = this.userService
            .getProfileHttp(this.user.email)
            .subscribe();
    }

    hasError(controlName: string, errorName: string) {
        return this.profileForm.controls[controlName].hasError(errorName);
    }

    openChangeProfileImageDialog() {
        const dialogRef = this.dialog.open(ChangeProfileImageModalComponent, {
            width: this.changePictureModal,
            data: {
                imageBase64: ''
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.profileImageBase64 = result;
            if (this.profileImageBase64) {
                this.onChangeProfileImage(this.profileImageBase64);
            } else {
                this.openSnackBar(
                    'Image was not filterName',
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
                name: this.profileForm.value.name,
                oldPassword: this.oldPassword,
                newPassword: this.newPassword,
                retypeNewPassword: this.retypeNewPassword
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'nothing') {
                this.openSnackBar(
                    'Nothing changed',
                    SnackBarClasses.Warn,
                    this.snackbarDuration
                );
                return;
            }
            if (
                !result.oldPassword ||
                !result.newPassword ||
                !result.retypeNewPassword
            ) {
                this.openSnackBar(
                    'Please fill in passwords fields',
                    SnackBarClasses.Danger,
                    this.snackbarDuration
                );
                return;
            }
            this.onChangeUserPassword(
                result.oldPassword,
                result.newPassword,
                result.retypeNewPassword
            );
        });
    }

    onChangeUserData() {
        const email = this.profileForm.value.email;
        const name = this.profileForm.value.name;

        if (!email) {
            this.error = 'Email is required';
            return false;
        }

        if (email === this.oldEmail && name === this.oldName) {
            this.openSnackBar(
                'Nothing to change',
                SnackBarClasses.Warn,
                this.snackbarDuration
            );
            return false;
        }

        this.user.email = email;
        this.user.name = name;
        this.updateUserDataSubscription = this.userService
            .updateUserData(this.user, 'info')
            .subscribe(() => {
                if (this.response.data.changedUserInfo) {
                    this.isDone = true;
                    this.message = this.response.data.message;
                    localStorage.setItem('userData', JSON.stringify(this.user));
                    this.openSnackBar(
                        this.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                } else {
                    this.isDone = false;
                }
            });
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.profileForm.touched && !this.isDone) {
            this.materialService.openDiscardChangesDialog(
                this.discard,
                this.discardChanged
            );
            return this.discardChanged;
        } else {
            return true;
        }
    }

    onChangeUserPassword(
        oldPassword: string,
        newPassword: string,
        retypeNewPassword: string
    ) {
        const passwordsObject = {
            user_id: this.user.id,
            oldPassword,
            newPassword,
            retypeNewPassword
        };
        this.updateUserDataSubscription = this.userService
            .updateUserData(this.user, 'password', passwordsObject)
            .subscribe(() => {
                if (this.response.data.passwordChanged) {
                    this.message = this.response.data.message;
                    this.openSnackBar(
                        this.message,
                        SnackBarClasses.Success,
                        this.snackbarDuration
                    );
                } else {
                    this.error = this.response.data.message;
                    this.openSnackBar(
                        this.error,
                        SnackBarClasses.Danger,
                        this.snackbarDuration
                    );
                }
            });
    }

    onChangeProfileImage(base64Image: string) {
        this.isLoading = true;
        this.updateProfileImage = this.userService
            .updateProfileImage(base64Image, this.user)
            .subscribe(() => {
                this.message = this.responseService.getResponse().message;
                this.user.profileImage = base64Image;
                localStorage.setItem('userData', JSON.stringify(this.user));
                this.openSnackBar(
                    this.message,
                    SnackBarClasses.Success,
                    this.snackbarDuration
                );
                this.isLoading = false;
            });
    }

    openSnackBar(message: string, style: string, duration: number) {
        this.materialService.openSnackBar(message, style, duration);
    }

    ngOnDestroy(): void {
        if (this.updateProfileImage) {
            this.updateProfileImage.unsubscribe();
        }
        if (this.updateUserDataSubscription) {
            this.updateUserDataSubscription.unsubscribe();
        }
    }
}
