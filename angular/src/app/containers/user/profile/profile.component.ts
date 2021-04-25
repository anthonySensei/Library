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
import { HelperService } from '../../../services/helper.service';

import { SnackBarClasses } from '../../../constants/snackBarClasses';
import { ChangedDataProfile } from '../../../constants/changedDataProfile';

import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { ChangeProfileImageModalComponent } from './change-profile-image/change-profile-image-modal.component';

import { User } from '../../../models/user.model';
import { ModalWidth } from '../../../constants/modalWidth';
import { PageTitles } from '../../../constants/pageTitles';
import { WarnMessages } from '../../../constants/warnMessages';
import { ErrorMessages } from '../../../constants/errorMessages';
import { KeyWords } from '../../../constants/keyWords';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select } from '@ngxs/store';
import { UserState } from '../../../store/user.state';

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
    done: boolean;

    user: User;

    error: string;
    oldPassword: string;
    newPassword: string;
    retypeNewPassword: string;

    emailValidation;

    changePasswordModalWidth = ModalWidth.W35P;
    changePictureModal = ModalWidth.W40P;

    @Select(UserState.User)
    user$: Observable<User>;

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private responseService: ResponseService,
        private helperService: HelperService,
        private materialService: MaterialService,
        private validationService: ValidationService,
        private breakpointObserver: BreakpointObserver,
        public dialog: MatDialog
    ) {
        breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(untilDestroyed(this)).subscribe(result => {
                if (result.matches) {
                    this.changePasswordModalWidth = ModalWidth.W95P;
                    this.changePictureModal = ModalWidth.W95P;
                }
            });
        breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Tablet]).pipe(untilDestroyed(this)).subscribe(result => {
                if (result.matches) {
                    this.changePasswordModalWidth = ModalWidth.W75P;
                    this.changePictureModal = ModalWidth.W85P;
                }
            });
        breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge]).pipe(untilDestroyed(this)).subscribe(result => {
                if (result.matches) {
                    this.changePasswordModalWidth = ModalWidth.W35P;
                    this.changePictureModal = ModalWidth.W40P;
                }
            });
    }

    ngOnInit(): void {
        document.title = PageTitles.PROFILE;
        this.isLoading = true;
        this.emailValidation = this.validationService.getEmailValidation();
        this.userHandle();
        this.initializeForm();
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => {
            this.user = user || {} as User;
            this.isLoading = false;
        });
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
        this.getUser$();
    }

    hasError(controlName: string, errorName: string): boolean {
        return this.profileForm.controls[controlName].hasError(errorName);
    }

    openChangeProfileImageDialog(): void {
        const dialogRef = this.dialog.open(ChangeProfileImageModalComponent, {
            width: this.changePictureModal,
            data: { imageBase64: '' }
        });

        dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((profileImage: string) => {
                if (profileImage) {
                    this.userService
                        .updateUserDataHttp(
                            { ...this.user, image: profileImage },
                            ChangedDataProfile.IMAGE
                        )
                        .pipe(untilDestroyed(this))
                        .subscribe(() => {
                            if (this.responseService.responseHandle()) {
                                this.done = true;
                                this.user.image = profileImage;
                                localStorage.setItem(
                                    'userData',
                                    JSON.stringify(this.user)
                                );
                            }
                        });
                } else {
                    this.materialService.openSnackbar(
                        WarnMessages.IMAGE_NOT_SELECTED,
                        SnackBarClasses.Warn
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

        dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe();
    }

    onChangeUserData(): void {
        const email = this.profileForm.value.email;
        const name = this.profileForm.value.name;

        if (!email || !name) {
            this.error = ErrorMessages.EMPTY_FIELDS;
            return;
        }

        if (this.user.name === name && this.user.email === email) {
            this.materialService.openSnackbar(
                WarnMessages.NOTHING_TO_CHANGE,
                SnackBarClasses.Warn
            );
            return;
        }

        this.userService
            .updateUserDataHttp(
                { ...this.user, email, name },
                ChangedDataProfile.INFO
            )
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                if (this.responseService.responseHandle()) {
                    this.done = true;
                    this.user.email = email;
                    this.user.name = name;
                    localStorage.setItem('userData', JSON.stringify(this.user));
                } else {
                    this.fieldsErrorHandle();
                }
            });
    }

    fieldsErrorHandle() {
        if (this.responseService.getResponse().message.toLowerCase().includes(KeyWords.EMAIL)) {
            this.error = this.responseService.getResponse().message;
            this.profileForm.controls.email.setErrors({
                incorrect: true
            });
        }
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.profileForm.touched && !this.done) {
            this.materialService.openDiscardChangesDialog(
                this.discard,
                this.discardChanged
            );
            return this.discardChanged;
        } else {
            return true;
        }
    }

    ngOnDestroy(): void {}
}
