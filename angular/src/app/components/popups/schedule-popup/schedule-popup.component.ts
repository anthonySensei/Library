import { Component, Inject, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { LibrarianState, LoadLibrarians } from '../../../store/state/librarian.state';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserPopupData } from '@shared/user-popup/user-popup.data';
import { Schedule } from '../../../models/schedule.model';
import { Days } from '../../../constants/days';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import colors from '../../../constants/colors';
import { CreateSchedule, EditSchedule } from '../../../store/state/schedule.state';
import moment from 'moment';

@Component({
  selector: 'app-schedule-popup',
  templateUrl: './schedule-popup.component.html',
  styleUrls: ['./schedule-popup.component.scss']
})
export class SchedulePopupComponent implements OnInit {

  isEdit: boolean;
  days: string[] = Object.values(Days);
  form: FormGroup;

  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: colors.dark.primary,
      buttonColor: '#fff'
    },
    dial: {
      dialBackgroundColor: colors.dark.primary,
    },
    clockFace: {
      clockFaceBackgroundColor: colors.dark.primary,
      clockHandColor: colors.yellow.primary,
      clockFaceTimeInactiveColor: '#fff'
    }
  };


  @Select(LibrarianState.Librarians)
  librarians$: Observable<User[]>;

  constructor(
      private store: Store,
      private dialog: MatDialogRef<UserPopupData>,
      @Inject(MAT_DIALOG_DATA) public data: Schedule,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(new LoadLibrarians());
    this.initForm();
  }

  initForm() {
    const { _id, start, librarian, end, weekDays } = this.data || {};
    this.isEdit = !!_id;
    this.form = new FormGroup({
      start: new FormControl((start && moment(start).format('HH:mm')) || '', [ Validators.required ]),
      end: new FormControl((end && moment(end).format('HH:mm')) || '', [ Validators.required ]),
      librarian: new FormControl(librarian || '', [Validators.required]),
      weekDays: new FormControl(weekDays || [], [Validators.required]),
    });
  }

  isValid(): boolean {
    return this.form.valid;
  }

  getTitle(): string {
    return this.isEdit ? 'Edit Schedule' : 'Create Schedule';
  }

  getActionTitle(): string {
    return this.isEdit ? 'Edit' : 'Create';
  }

  getDate(time: string): Date {
    const now = new Date();
    const [ timePart1, timePart2 ] = time.split(':');
    return new Date(new Date(now.getFullYear(), now.getMonth(), now.getDate(), +timePart1, +timePart2).toISOString());
  }

  createSchedule() {
    const { start: startTime, end: endTime, librarian, weekDays } = this.form.value;
    const start = this.getDate(startTime);
    const end = this.getDate(endTime);
    this.store.dispatch(new CreateSchedule({ start, librarian, end, weekDays })).subscribe(() => this.onClose());
  }

  editSchedule() {
    const { start: startTime, end: endTime, librarian, weekDays } = this.form.value;
    const start = this.getDate(startTime);
    const end = this.getDate(endTime);
    this.store.dispatch(new EditSchedule(this.data._id, { start, librarian, end, weekDays })).subscribe(() => this.onClose());
  }

  onDoAction() {
    this.isEdit ? this.editSchedule() : this.createSchedule();
  }

  onClose() {
    this.dialog.close();
  }
}
