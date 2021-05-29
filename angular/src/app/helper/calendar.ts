import RRule, { Weekday } from 'rrule';
import { Days } from '../constants/days';
import moment from 'moment';
import { Schedule } from '../models/schedule.model';
import { CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { User } from '../models/user.model';
import colors from '../constants/colors';

export const getByWeekDay = (days: string[]): Weekday[] => {
    const byWeekday: Weekday[] = [];
    days.forEach(day => {
        switch (day) {
            case Days.MONDAY:
                return byWeekday.push(RRule.MO);
            case Days.TUESDAY:
                return byWeekday.push(RRule.TU);
            case Days.WEDNESDAY:
                return byWeekday.push(RRule.WE);
            case Days.THURSDAY:
                return byWeekday.push(RRule.TH);
            case Days.FRIDAY:
                return byWeekday.push(RRule.FR);
            case Days.SATURDAY:
                return byWeekday.push(RRule.SA);
            case Days.SUNDAY:
                return byWeekday.push(RRule.SU);
        }
    });
    return byWeekday;
};

export const getWorkDayDate = (rRuleTime: Date, time: Date): Date => {
    return new Date(rRuleTime.getFullYear(), rRuleTime.getMonth(), rRuleTime.getDate(), time.getHours(), time.getMinutes());
};

export const getWorkDayTimePeriod = (start: Date, end: Date): string => {
    return moment(start).format(`HH:mm`) + `-` + moment(end).format(`HH:mm`);
};

export const getCalendarEvents = (schedules: Schedule[], actions: CalendarEventAction[]): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    schedules.forEach(schedule => {
        const byWeekday = getByWeekDay(schedule.weekDays);
        const rule = new RRule({
            freq: RRule.WEEKLY,
            byweekday: byWeekday,
            dtstart: new Date((schedule.librarian as User).createdAt),
            until: new Date(Date.UTC(new Date().getFullYear(), 12, 31))
        });
        rule.all().forEach(date => {
            events.push({
                id: (schedule.librarian as User)._id,
                start: getWorkDayDate(date, new Date(schedule.start)),
                end: getWorkDayDate(date, new Date(schedule.end)),
                title: `${ (schedule.librarian as User).name }: ${getWorkDayTimePeriod(new Date(schedule.start), new Date(schedule.end))}`,
                color: colors.yellow,
                actions,
                resizable: {
                    beforeStart: true,
                    afterEnd: true
                },
                draggable: true
            });
        });
    });
    return events;
};
