import { Component, Inject, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { LibrarianState, LoadLibrarians } from '../../../store/state/librarian.state';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreateUser, EditUser } from '../../../store/state/user.state';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserPopupData } from '@shared/user-popup/user-popup.data';
import { Schedule } from '../../../models/schedule.model';
import { Days } from '../../../constants/days';

@Component({
  selector: 'app-schedule-popup',
  templateUrl: './schedule-popup.component.html',
  styleUrls: ['./schedule-popup.component.scss']
})
export class SchedulePopupComponent implements OnInit {

  isEdit: boolean;
  days: string[] = Object.values(Days);
  form: FormGroup;

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
      start: new FormControl(start || '', [ Validators.required ]),
      end: new FormControl(end || '', [ Validators.required ]),
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

  createSchedule() {
    const { start: startTime, end: endTime, librarian, weekDays } = this.form.value;
    const now = new Date();
    const [ startPart1, startPart2 ] = startTime.split(':');
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startPart1, startPart2);
    const [ endPart1, endPart2 ] = startTime.split(':');
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endPart1, endPart2);
    console.log(start);
    console.log(end);
    console.log(librarian);
    console.log(weekDays);
  }

  editSchedule() {
  }

  onDoAction() {
    this.isEdit ? this.editSchedule() : this.createSchedule();
  }

  onClose() {
    this.dialog.close();
  }
}
