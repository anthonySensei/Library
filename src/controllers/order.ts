import { Request, Response } from 'express';

import logger from '../config/logger';
import pool from '../config/postgres';
import { Error } from 'mongoose';

const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Order = require('../schemas/order');
const Loan = require('../schemas/loan');
const Author = require('../schemas/author');
const Student = require('../schemas/student');
const Librarian = require('../schemas/librarian');
const Book = require('../schemas/book');
const Department = require('../schemas/department');

const helper = require('../helper/responseHandle');
const mailSender = require('../helper/mailSender');
const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const filters = require('../constants/filters');
const mailMessages = require('../constants/mailMessages');

const getCondition = (departmentId: number, loanDate: any, nextDay: any, isShowNotLoaned: any) => {
    let departmentCondition = {};
    let dateCondition = {};
    let isShowNotLoanedCondition = {};

    if (departmentId) {
        departmentCondition = { departmentId };
    }

    if (loanDate) {
        dateCondition = {
            loan_time: {
                [Op.between]: [loanDate, nextDay]
            }
        };
    }

    if (isShowNotLoaned === 'true') {
        isShowNotLoanedCondition = {
            loan_time: null
        };
    }

    return {
        ...departmentCondition,
        ...dateCondition,
        ...isShowNotLoanedCondition
    };
};

exports.getAllOrders = async (req: Request, res: Response) => {
    const page = Number(req.query.pageNumber);
    const pageSize = Number(req.query.pageSize);
    const sortOrder = (req.query.sortOrder as string).toUpperCase();
    const filterName = req.query.filterName;
    const filterValue = req.query.filterValue;
    const departmentId = Number(req.query.departmentId);
    const orderDate = req.query.orderDate;
    const nextDay = req.query.nextDay;
    const isShowNotLoaned = req.query.isShowNotLoaned;
    const studentId = Number(req.query.studentId);
    let studentCondition = {};
    let bookCondition = {};

    const like = { [Op.iLike]: `%${filterValue}%` };
    if (filterName === filters.READER_TICKET) {
        studentCondition = { reader_ticket: like };
    } else if (filterName === filters.ISBN) { bookCondition = { isbn: like }; }

    if (studentId) { studentCondition = { id: studentId }; }

    const includeArr = [
        {
            model: Student,
            where: studentCondition
        },
        {
            model: Book,
            include: {
                model: Author
            },
            where: bookCondition
        },
        { model: Department }
    ];

    try {
        const quantity = await Order.count({
            include: includeArr,
            where: getCondition(
                departmentId,
                orderDate,
                nextDay,
                isShowNotLoaned
            )
        });

        pool.query(`
            SELECT o.id, o.order_time, o.loan_time, s.id AS "studentId", s.name AS "studentName", s.email AS "studentEmail",
            b.id AS "bookId", b.isbn AS "bookISBN", b.name AS "bookName", b.year AS "bookYear", b.description AS "bookDescription",
            a.name AS "authorName", d.address as "departmentAddress"
            FROM order_s AS o
            INNER JOIN student_s AS s ON o."studentId" = s.id
            INNER JOIN book_s AS b ON o."bookId" = b.id
            LEFT OUTER JOIN author_s AS a ON b."authorId" = a.id
            LEFT OUTER JOIN department_s AS d ON o."departmentId" = d.id
            ORDER BY o.order_time ${sortOrder} LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize};
        `, (err: Error, result: any) => {
            if (err) {
                logger.error('Error getting orders', err.message);
                return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
            }

            const ordersArr = [];
            for (const order of result.rows) {
                let ordersObj: any = {
                    id: order.id,
                    orderTime: order.order_time,
                    loanTime: order.loan_time,
                    bookISBN: order.bookISBN,
                    departmentAddress: order.departmentAddress
                };

                if (!studentId) {
                    ordersObj = {
                        ...ordersObj,
                        student: {
                            id: order.studentId,
                            name: order.studentName,
                            email: order.studentEmail,
                        },
                        department: {
                            address: order.departmentAddress
                        },
                        book: {
                            bookId: order.bookId,
                            isbn: order.bookISBN,
                            name: order.bookName,
                            year: order.bookYear,
                            author: {
                                name: order.authorName
                            }
                        }
                    };
                }

                ordersArr.push(ordersObj);
            }
            const data = {
                orders: ordersArr,
                message: successMessages.SUCCESSFULLY_FETCHED,
                quantity
            };
            return helper.responseHandle(res, 200, data);
        });


    } catch (err) {
        logger.error('Error getting orders', err.message);
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.orderBook = async (req: Request, res: Response) => {
    const studentEmail = req.body.studentEmail;
    const bookId = req.body.bookId;
    const orderTime = req.body.time;
    if (!req.body) {
        return helper.responseErrorHandle(
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
            return helper.responseErrorHandle(
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
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.THERE_ARE_NO_AVAILABLE_BOOKS
            );
        } else {
            const bookOrder = new Order({
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

            helper.responseHandle(res, 200, data);
        }
    } catch (err) {
        logger.error('Cannot order book', err.message);
        helper.responseErrorHandle(
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
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }

    try {
        const order = await Order.findOne({ where: { id: orderId } });
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
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        logger.error('Cannot loan book from order', err.message);
        helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
