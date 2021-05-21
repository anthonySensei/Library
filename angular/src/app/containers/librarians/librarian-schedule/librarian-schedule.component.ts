import { Component, OnDestroy, OnInit } from '@angular/core';

import { addDays, addHours, startOfDay, subDays } from 'date-fns';
import { CalendarEvent, CalendarEventAction } from 'angular-calendar';

const colors: any = {
    yellow: {
        primary: '#FFDF6C',
        secondary: '#707070'
    }
};

@Component({
    selector: 'app-librarian-schedule',
    templateUrl: './librarian-schedule.component.html',
    styleUrls: ['./librarian-schedule.component.scss']
})
export class LibrarianScheduleComponent implements OnInit, OnDestroy {

    actions: CalendarEventAction[] = [
        {
            label: '<span class="ml-1 text-main">Edit</span>',
            a11yLabel: 'Edit',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                this.onEventEdit(event);
            }
        },
        {
            label: '<span class="ml-1 text-main">Delete</span>',
            a11yLabel: 'Delete',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                this.onEventDelete(event);
            }
        }
    ];

    events: CalendarEvent[] = [
        {
            start: subDays(startOfDay(new Date()), 1),
            end: addDays(new Date(), 1),
            title: 'Іван Васильович 10.00-18.00',
            color: colors.yellow,
            actions: this.actions,
            resizable: {
                beforeStart: true,
                afterEnd: true
            },
            draggable: true
        },
        {
            start: addHours(startOfDay(new Date()), 2),
            end: addHours(new Date(), 2),
            title: 'Максим Олександрович 14.00-18.00',
            color: colors.yellow,
            actions: this.actions,
            resizable: {
                beforeStart: true,
                afterEnd: true
            },
            draggable: true
        }
    ];

    librarianSelect: number;

    constructor() {}

    ngOnInit(): void {}

    onEventEdit(event: CalendarEvent): void {
        console.log(event);
    }

    onEventDelete(event: CalendarEvent): void {
        console.log(event);
    }

    ngOnDestroy(): void {}
}
