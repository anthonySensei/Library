import { Component, Input, OnInit } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { Subject } from 'rxjs';
import { isSameDay, isSameMonth } from 'date-fns';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  activeDayIsOpen = true;
  refresh: Subject<any> = new Subject();
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();

  @Input() events: CalendarEvent[];

  constructor() { }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  onTimeChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    console.log(event, newStart, newEnd);
  }

  onEventDrag(e: DragEvent | CalendarEvent) {
    const event: CalendarEvent = e as CalendarEvent;
    console.log(event);
  }

  onEventClick(event: CalendarEvent): void {
    console.log(event);
  }

  onDayClick({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
          (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
          events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  ngOnInit() {
  }

}
