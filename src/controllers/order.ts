import { Request, Response } from 'express';

import logger from '../config/logger';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

import Order from '../schemas/order';

import { responseErrorHandle, responseSuccessHandle } from '../helper/response';
import { OrderSchema } from '../models/order';

const SequelizeOrder = require('../schemas/sorder');
const Loan = require('../schemas/sloan');
const Student = require('../schemas/student');
const Librarian = require('../schemas/librarian');
const Book = require('../schemas/sbook');
const Department = require('../schemas/sdepartment');

const mailSender = require('../helper/email');
const mailMessages = require('../constants/email');

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find() as OrderSchema[];
        const data = {
            orders: orders.map(order => order.toJSON()),
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error('Error getting orders', err.message);
        return responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.orderBook = async (req: Request, res: Response) => {
    const studentEmail = req.body.studentEmail;
    const bookId = req.body.bookId;
    const orderTime = req.body.time;
    if (!req.body) {
        return responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
    try {
        const student = await Student.findOne({
            where: {
                email: studentEmail
            }
        });
        if (!student) {
            return responseErrorHandle(
                res,
                400,
                errorMessages.USER_EMAIL_EXISTS
            );
        }

        const book = await Book.findOne({
            where: { id: bookId },
            include: { model: Department }
        });
        if (book.get().quantity <= 0) {
            return responseErrorHandle(
                res,
                400,
                errorMessages.THERE_ARE_NO_AVAILABLE_BOOKS
            );
        } else {
            const bookOrder = new SequelizeOrder({
                order_time: orderTime,
                studentId: student.get().id,
                bookId,
                departmentId: book.get().department_.get().id
            });
            await bookOrder.save();
            await book.update({ quantity: book.get().quantity - 1 });
            await mailSender.sendMail(
                studentEmail,
                mailMessages.subjects.BOOK_ORDERED,
                mailMessages.messages.BOOK_ORDERED
            );

            const data = {
                isSuccessful: true,
                message: successMessages.SUCCESSFULLY_ORDERED
            };

            responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        logger.error('Cannot order sbook', err.message);
        responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.loanBookFromOrder = async (req: Request, res: Response) => {
    const orderId = req.body.orderId;
    const bookId = req.body.bookId;
    const studentId = req.body.studentId;
    const librarianEmail = req.body.librarianEmail;
    const loanTime = req.body.loanTime;

    if (!orderId || !bookId || !studentId || !librarianEmail || !loanTime) {
        return responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }

    try {
        const order = await SequelizeOrder.findOne({ where: { id: orderId } });
        await order.update({ loan_time: loanTime });
        const librarian = await Librarian.findOne({
            where: { email: librarianEmail }
        });
        const book = await Book.findOne({ where: { id: bookId } });
        await Loan.create({
            loan_time: loanTime,
            bookId,
            studentId,
            librarianId: librarian.get().id,
            departmentId: book.get().departmentId
        });
        const data = {
            isSuccessful: true,
            message: successMessages.SUCCESSFULLY_LOANED
        };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error('Cannot loan book from order', err.message);
        responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
