import { Request, Response } from 'express';

import logger from '../config/logger';

import Book from '../schemas/book';
import Loan from '../schemas/loan';
import User from '../schemas/user';

import { LoanSchema } from '../models/loan';
import { BookSchema } from '../models/book';

import { responseErrorHandle, responseSuccessHandle } from '../helper/responseHandle';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';
import { removedEmptyFields } from '../helper/object';

const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const SequelizeLoan = require('../schemas/sloan');
const Student = require('../schemas/student');
const Librarian = require('../schemas/librarian');
const SequelizeBook = require('../schemas/sbook');
const Department = require('../schemas/sdepartment');
const models = require('../constants/models');

export const getLoans = async (req: Request, res: Response) => {
    const { filterValue, sortName, sortOrder, page, pageSize, loanedAt } = req.query;
    const showOnlyDebtors = !!req.query.showOnlyDebtors;
    const showOnlyReturned = !!req.query.showOnlyReturned;
    const regex = new RegExp(filterValue as string, 'i');

    const sort: any = {};
    sort[sortName as string] = sortOrder;
    const filterDate = new Date(String(loanedAt));
    const oneDay = 24 * 60 * 60 * 1000;
    const tomorrow = new Date(filterDate.getTime() + oneDay);
    const filterCondition = {
        loanedAt: loanedAt && { $gte: filterDate, $lt: tomorrow },
        returnedAt: (showOnlyReturned && { $exists: true, $ne: null }) || (showOnlyDebtors && { $exists: false }) || null
        // $and: [ { $or: [{name: regex }, { email: regex }, { phone: regex }] } ]
    };
    const filter: any = removedEmptyFields(filterCondition);

    try {
        const quantity = await Loan.countDocuments(filter);
        const loans = await Loan.find()
            .find(filter, {}, { limit: Number(pageSize), skip: (Number(page) - 1) * Number(pageSize), sort })
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

exports.getLoanStatistic = (loans: any) => {
    let last30;

    if (loans) { last30 = [...loans].splice(0, 30); } else { last30 = []; }

    const loansStatisticArr = [];
    for (const loan of last30) {
        loan.loanTime.setHours(0, 0, 0, 0);
        const loanObj = { books: 1, loanTime: loan.loanTime.toLocaleDateString() };

        if (loansStatisticArr.length > 0) {
            let index;
            index = loansStatisticArr.findIndex(statistic => statistic.loanTime === loanObj.loanTime);
            index !== -1 ? loansStatisticArr[index].books += 1 : loansStatisticArr.push(loanObj);
        } else {
            loansStatisticArr.push(loanObj);
        }
    }
    return loansStatisticArr;
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

exports.getLoansStatistic = (req: Request, res: Response) => {
    const model = req.query.model;
    const value = req.query.value;
    let userCondition = {};
    let bookCondition = {};
    let librarianCondition = {};
    let departmentCondition = {};
    if (model === models.USER) {
        userCondition = { reader_ticket: value };
    } else if (model === models.BOOK) {
        bookCondition = { isbn: value };
    } else if (model === models.LIBRARIAN) {
        librarianCondition = { email: value };
    } else if (model === models.DEPARTMENT) {
        departmentCondition = { id: value };
    } else {
        const data = { statistic: [] };
        return responseSuccessHandle(res, 200, data);
    }

    SequelizeLoan.findAll({
        include: [
            {
                model: Student,
                where: userCondition
            },
            {
                model: Librarian,
                where: librarianCondition
            },
            { model: SequelizeBook, where: bookCondition },
            { model: Department, where: departmentCondition }
        ],
        where: { loan_time: { [Op.gte]: new Date().setDate(new Date().getDate() - 30) } },
        order: [['loan_time', 'ASC']]
    })
        .then((loans: any) => {
            const loansStatisticArr = [];

            for (const loan of loans) {
                const loanValues = loan.get();
                const studentData = loanValues.student_.get();
                const bookData = loanValues.book_.get();
                loanValues.loan_time.setHours(0, 0, 0, 0);
                const loanObj = {
                    books: 1,
                    loanTime: loanValues.loan_time.toLocaleDateString(),
                    returnedTime: loanValues.returned_time
                        ? loanValues.returned_time.toLocaleDateString()
                        : '',
                    student: {
                        name: studentData.name,
                        readerTicket: studentData.reader_ticket
                    },
                    book: {
                        name: bookData.name
                    },
                    librarian: {
                        name: loanValues.librarian_.get().name
                    },
                    department: {
                        address: loanValues.department_.get().address
                    }
                };

                if (loansStatisticArr.length > 0) {
                    let index;
                    index = loansStatisticArr.findIndex(statistic => statistic.loanTime === loanObj.loanTime);
                    index !== -1 ? loansStatisticArr[index].books += 1 : loansStatisticArr.push(loanObj);
                } else {
                    loansStatisticArr.push(loanObj);
                }
            }
            const data = { statistic: loansStatisticArr, message: successMessages.SUCCESSFULLY_FETCHED };
            return responseSuccessHandle(res, 200, data);
        })
        .catch((err: any) => {
            return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
        });
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
