import { Request, Response } from 'express';
import moment from 'moment';

import logger from '../config/logger';

import Book from '../schemas/book';
import Loan from '../schemas/loan';
import User from '../schemas/user';

import { LoanSchema, Statistic } from '../models/loan';
import { BookSchema } from '../models/book';
import { UserSchema } from '../models/user';

import { responseErrorHandle, responseSuccessHandle } from '../helper/response';
import { removedEmptyFields } from '../helper/object';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';
import { getStatistic } from '../helper/statistic';

export const getLoans = async (req: Request, res: Response) => {
    const { sortName, sortOrder, page, pageSize, loanedAt, librarianId, userId } = req.query;
    const showOnlyDebtors = !!req.query.showOnlyDebtors;
    const showOnlyReturned = !!req.query.showOnlyReturned;

    const sort: any = {};
    sort[sortName as string] = sortOrder;
    const filterDate = new Date(String(loanedAt));
    const tomorrow = moment(filterDate.getTime()).add(1, 'days').toDate();
    const filterCondition = {
        loanedAt: loanedAt && { $gte: filterDate, $lt: tomorrow },
        returnedAt: (showOnlyReturned && { $exists: true, $ne: null }) || (showOnlyDebtors && { $exists: false }) || null
    };
    const filter: any = removedEmptyFields(filterCondition);

    if (librarianId) {
        filter.$and = [ { librarian: librarianId } ];
    }

    if (userId) {
        filter.$and = [ { user: userId } ];
    }

    try {
        const quantity = await Loan.countDocuments(filter);
        const loans = await Loan
            .find(filter, {}, { limit: Number(pageSize), skip: Number(page) * Number(pageSize), sort })
            .populate('book')
            .populate('user')
            .populate('librarian') as LoanSchema[];
        const loansData = loans.map(loan => {
            const { user, book, librarian } = loan;

            return ({
                ...loan.toJSON(),
                user: { name: user.name, email: user.email, phone: user.phone },
                book: { title: book.title, isbn: book.isbn, year: book.year },
                librarian: { name: librarian.name, email: librarian.email, phone: librarian.phone },
            });
        });
        const data = { loans: loansData, quantity, message: successMessages.SUCCESSFULLY_FETCHED };

        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error(`Error getting loans: ${err.message}`);
        return responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

export const returnBook = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        const loan = await Loan.findById(id) as LoanSchema;

        if (!loan) {
            return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
        }

        const book = await Book.findById(loan.book) as BookSchema;
        await Book.findByIdAndUpdate(loan.book, { quantity: book.quantity + 1 });
        await Loan.findByIdAndUpdate(id, { returnedAt: new Date() });
        responseSuccessHandle(res, 200, { message: successMessages.SUCCESSFULLY_RETURNED_BOOK });
    } catch (err) {
        logger.error(`Error returning book: ${err.message}`);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const loanBook = async (req: Request, res: Response) => {
    const { userCredentials, librarianId, bookId } = req.body;

    if (!userCredentials || !librarianId || !bookId) {
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        const student = { librarian: { $ne: true }, admin: { $ne: true } };
        const user = await User.findOne({ ...student, $or: [ { phone: userCredentials }, { email: userCredentials } ] });

        if (!user) {
            return responseErrorHandle(res, 400, errorMessages.CANNOT_FIND_USER);
        }

        const book = await Book.findOne({ _id: bookId, quantity: { $gt: 0 } }) as BookSchema;

        if (!book) {
            return responseErrorHandle(res, 500, errorMessages.BOOK_IS_NOT_AVAILABLE_NOW);
        }

        await Loan.create({ book: bookId, user: user._id, librarian: librarianId, loanedAt: new Date() });
        await Book.findByIdAndUpdate(bookId, { quantity: book.quantity - 1 });
        responseSuccessHandle(res, 200, { message: successMessages.SUCCESSFULLY_LOANED });
    } catch (err) {
        logger.error(`Error loaning book: ${err.message}`);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

// TODO Optimize code
export const getUserStatistic = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        const monthAgo = moment().subtract('1', 'months').toDate();
        const user = await User.findOne({ email }) as UserSchema;
        const loans = await Loan.find({  loanedAt: { $gt: monthAgo }, user: user._id }) as LoanSchema[];
        const statistic: Statistic[] = getStatistic(loans);
        responseSuccessHandle(res, 200,  { message: successMessages.SUCCESSFULLY_FETCHED, statistic });
    } catch (err) {
        logger.error('Error getting summary statistic', err.message);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const getLibrarianStatistic = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        const monthAgo = moment().subtract('1', 'months').toDate();
        const librarian = await User.findOne({ email }) as UserSchema;
        const loans = await Loan.find({  loanedAt: { $gt: monthAgo }, librarian: librarian._id }) as LoanSchema[];
        const statistic: Statistic[] = getStatistic(loans);
        responseSuccessHandle(res, 200,  { message: successMessages.SUCCESSFULLY_FETCHED, statistic });
    } catch (err) {
        logger.error('Error getting summary statistic', err.message);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const getBookStatistic = async (req: Request, res: Response) => {
    try {
        const { isbn } = req.query;
        const monthAgo = moment().subtract('1', 'months').toDate();
        const book = await Book.findOne({ isbn }) as BookSchema;

        if (!book) {
            return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
        }

        const loans = await Loan.find({  loanedAt: { $gt: monthAgo }, book: book._id }) as LoanSchema[];
        const statistic: Statistic[] = getStatistic(loans);
        responseSuccessHandle(res, 200,  { message: successMessages.SUCCESSFULLY_FETCHED, statistic });
    } catch (err) {
        logger.error('Error getting summary statistic', err.message);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const getSummaryStatistic = async (req: Request, res: Response) => {
    try {
        const monthAgo = moment().subtract('1', 'months').toDate();
        const totalBooks = await Book.countDocuments();
        const loansForLastMonth = await Loan.countDocuments({  loanedAt: { $gt: monthAgo } });
        const allDebtorsLoans = await Loan.find({  loanedAt: { $gt: monthAgo }, returnedAt: { $exists: false } }) as LoanSchema[];
        const totalDebtors = new Set(allDebtorsLoans.map(loan => loan.user)).size;
        const data = {
            summaryStatistic: { totalBooks, loansForLastMonth, totalDebtors },
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        responseSuccessHandle(res, 200,  data);
    } catch (err) {
        logger.error('Error getting summary statistic', err.message);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
