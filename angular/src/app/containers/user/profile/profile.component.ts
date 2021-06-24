import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { MatDialog } from '@angular/material/dialog';

import { Observable, Subject } from 'rxjs';

import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { MaterialService } from '../../../services/material.service';

import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { ChangeProfileImageModalComponent } from './change-profile-image/change-profile-image-modal.component';

import { User } from '../../../models/user.model';
import { ModalWidth } from '../../../constants/modalWidth';
import { PageTitles } from '../../../constants/pageTitles';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Select, Store } from '@ngxs/store';
import { EditUser, UserState } from '../../../store/state/user.state';

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

    emailValidation: RegExp;
    phoneValidation: RegExp;

    changePasswordModalWidth = '468px';
    changePictureModal = ModalWidth.W40P;

    @Select(UserState.User)
    user$: Observable<User>;

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private materialService: MaterialService,
        private validationService: ValidationService,
        public dialog: MatDialog,
        private store: Store
    ) {}

    ngOnInit(): void {
        document.title = PageTitles.PROFILE;
        this.isLoading = true;
        this.emailValidation = this.validationService.getEmailValidation();
        this.phoneValidation = this.validationService.getPhoneValidation();
        this.userHandle();
        this.initForm();
    }

    initForm(): void {
        this.profileForm = new FormGroup({
            email: new FormControl(this.user?.email, [Validators.required, Validators.email, Validators.pattern(this.emailValidation)]),
            name: new FormControl(this.user?.name, [Validators.required]),
            phone: new FormControl(this.user?.phone, [Validators.required, Validators.pattern(this.phoneValidation)]),
        });
    }

    getUser$(): void {
        this.user$.pipe(untilDestroyed(this)).subscribe(user => {
            this.user = user || {} as User;
            this.isLoading = false;
        });
    }

    userHandle(): void {
        this.getUser$();
    }

    hasError(controlName: string, errorName: string): boolean {
        return this.profileForm.controls[controlName].hasError(errorName);
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        // if (this.profileForm.touched && !this.done) {
        //     this.materialService.openDiscardChangesDialog(
        //         this.discard,
        //         this.discardChanged
        //     );
        //     return this.discardChanged;
        // } else {
        //     return true;
        // }
        return true;
    }

    onEditUser() {
        const { email, name, phone } = this.profileForm.value;
        this.store.dispatch(new EditUser({ email, name, phone }));
    }

    onOpenChangePasswordPopup(): void {
        this.dialog.open(ChangePasswordModalComponent, { width: this.changePasswordModalWidth, disableClose: true });
    }

    onOpenChangeProfileImagePopup(): void {
        this.dialog.open(ChangeProfileImageModalComponent, { width: this.changePictureModal, disableClose: true });
    }

    ngOnDestroy(): void {}
}
