import { Request, Response } from 'express';
import moment from 'moment';

import logger from '../config/logger';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';
import { emailMessages, emailSubjects } from '../constants/email';

import Order from '../schemas/order';
import Book from '../schemas/book';
import User from '../schemas/user';
import Loan from '../schemas/loan';

import { OrderSchema } from '../models/order';
import { BookSchema } from '../models/book';
import { UserSchema } from '../models/user';

import { responseErrorHandle, responseSuccessHandle } from '../helper/response';
import { sendMail } from '../helper/email';
import { removedEmptyFields } from '../helper/object';

export const getOrders = async (req: Request, res: Response) => {
    // const { filterValue, sortName, sortOrder, page, pageSize, loanedAt } = req.query;
    const { sortName, sortOrder, page, pageSize, returnedAt } = req.query;
    const showOnlyNotLoaned = !!req.query.showOnlyNotLoaned;
    const showOnlyLoaned = !!req.query.showOnlyLoaned;
    // const regex = new RegExp(filterValue as string, 'i');

    const sort: any = {};
    sort[sortName as string] = sortOrder;
    const filterDate = new Date(String(returnedAt));
    const tomorrow = moment(filterDate.getTime()).add(1, 'days').toDate();
    const filterCondition = {
        returnedAt: returnedAt && { $gte: filterDate, $lt: tomorrow },
        loanedAt: (showOnlyLoaned && { $exists: true, $ne: null }) || (showOnlyNotLoaned && { $exists: false }) || null
        // $and: [ { $or: [{name: regex }, { email: regex }, { phone: regex }] } ]
    };
    const filter: any = removedEmptyFields(filterCondition);

    try {
        const quantity = await Order.countDocuments(filter);
        const orders = await Order
            .find(filter, {}, { limit: Number(pageSize), skip: Number(page) * Number(pageSize), sort })
            .populate('book')
            .populate('user')
            .populate('librarian') as OrderSchema[];
        const data = {
            orders: orders.map(order => order.toJSON()),
            message: successMessages.SUCCESSFULLY_FETCHED,
            quantity
        };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error('Error getting orders', err.message);
        return responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

export const orderBook = async (req: Request, res: Response) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    try {
        const user = await User.findById(userId) as UserSchema;

        if (!user) {
            return responseErrorHandle(res, 400, errorMessages.USER_DOES_NOT_EXIST);
        }

        const book = await Book.findOne({ _id: bookId, quantity: { $gt: 0 } }) as BookSchema;

        if (!book) {
            return responseErrorHandle(res, 500, errorMessages.BOOK_IS_NOT_AVAILABLE_NOW);
        }

        await Order.create({ book: bookId, user: user._id, orderedAt: new Date() });
        await Book.findByIdAndUpdate(bookId, { quantity: book.quantity - 1 });
        await sendMail(user.email, emailSubjects.BOOK_ORDERED, emailMessages.bookOrdered(user.name));
        responseSuccessHandle(res, 200, { message: successMessages.SUCCESSFULLY_ORDERED });
    } catch (err) {
        logger.error('Cannot order book', err.message);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const loanBookFromOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, librarianId, bookId } = req.body;

    if (!id || !bookId || !userId || !librarianId) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        await Loan.create({ book: bookId, user: userId, librarian: librarianId, loanedAt: new Date() });
        await Order.findByIdAndUpdate(id, { librarian: librarianId, loanedAt: new Date() });
        return responseSuccessHandle(res, 200, { message: successMessages.SUCCESSFULLY_LOANED });
    } catch (err) {
        logger.error('Cannot loan book from order', err.message);
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
