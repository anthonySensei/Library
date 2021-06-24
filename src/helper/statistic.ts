import { LoanSchema, Statistic } from '../models/loan';
import moment from 'moment';

export const getStatistic = (loans: LoanSchema[]): Statistic[] => {
    const dates = loans.map(loan => moment(loan.loanedAt).format('DD/MM/YYYY'));
    const statistic: Statistic[] = [];
    dates.forEach(date => {
        const index = statistic.findIndex(s => s.name === date);

        if (index === -1) {
            statistic.push({ name: date, value: 1 });
            return;
        }

        statistic[index].value = statistic[index].value + 1;
    });
    return statistic;
};
