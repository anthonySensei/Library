import RRule, { Weekday } from 'rrule';
import { Days } from '../constants/days';
import moment from 'moment';

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
