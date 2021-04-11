import { Component, OnInit } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { addDays, addHours, endOfMonth, startOfDay, subDays } from 'date-fns';

const colors: any = {
    yellow: {
        primary: '#FFDF6C',
        secondary: '#707070'
    }
};

@Component({
    selector: 'app-schedule-section',
    templateUrl: './schedule-section.component.html'
})
export class ScheduleSectionComponent implements OnInit {

    events: CalendarEvent[] = [
        {
            start: subDays(startOfDay(new Date()), 1),
            end: addDays(new Date(), 1),
            title: 'Іван Васильович 10.00-18.00',
            color: colors.yellow,
            allDay: true,
            resizable: {
                beforeStart: true,
                afterEnd: true
            },
            draggable: true
        },
        {
            start: startOfDay(new Date()),
            title: 'Василь Васильович 12.00-18.00',
            color: colors.yellow,
        },
        {
            start: subDays(endOfMonth(new Date()), 3),
            end: addDays(endOfMonth(new Date()), 3),
            title: 'Іван Олександрович 14.00-18.00',
            color: colors.blue,
            allDay: true
        },
        {
            start: addHours(startOfDay(new Date()), 2),
            end: addHours(new Date(), 2),
            title: 'Максим Олександрович 14.00-18.00',
            color: colors.yellow,
            resizable: {
                beforeStart: true,
                afterEnd: true
            },
            draggable: true
        }
    ];

    constructor() {}

    ngOnInit(): void {
    }
}
