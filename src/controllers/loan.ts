import { responseErrorHandle, responseSuccessHandle } from '../helper/responseHandle';
import { Request, Response } from 'express';
import Loan from '../schemas/loan';
import { LoanSchema } from '../models/loan';

const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const SequelizeLoan = require('../schemas/sloan');
const Student = require('../schemas/student');
const Librarian = require('../schemas/librarian');
const Book = require('../schemas/sbook');
const Department = require('../schemas/sdepartment');
const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const models = require('../constants/models');

exports.getAllLoans = async (req: Request, res: Response) => {

    try {
        const quantity = await Loan.countDocuments();
        const loans = await Loan.find().populate('Book').populate('User') as LoanSchema[];
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

exports.getLoans = async (modelId: any, modelName: any) => {
    let model: any;
    let condition: any;
    let info: any;

    if (modelName === models.LIBRARIAN) {
        condition = { librarianId: modelId };
        model = Student;
    } else if (modelName === models.STUDENT) {
        condition = { studentId: modelId };
        model = Librarian;
    }

    try {
        const loans = await SequelizeLoan.findAll({
            where: condition,
            include: [
                { model },
                { model: Book },
                { model: Department }
            ],
            order: [['loan_time', 'ASC']]
        });
        const loansArr: any = [];
        if (loans.length > 0) {
            loans.forEach((loan: any) => {
                const loanValues = loan.get();

                if (modelName === models.LIBRARIAN) {
                    info = { studentTicketReader: loanValues.student_.get().reader_ticket};
                } else if (modelName === models.STUDENT) {
                    info = { librarianEmail: loanValues.librarian_.get().email, departmentAddress: loanValues.department_.get().address };
                }

                loansArr.push({
                    ...info,
                    loanTime: loanValues.loan_time,
                    returnedTime: loanValues.returned_time,
                    bookISBN: loanValues.book_.get().isbn
                });
            });
            return loansArr;
        }
        return null;
    } catch (err) {
        return null;
    }
};

exports.returnBook = async (req: Request, res: Response) => {
    const loanId = req.body.loanId;
    const bookId = req.body.bookId;
    const returnedTime = req.body.returnedTime;

    if (!loanId || !bookId || !returnedTime) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        const loan = await SequelizeLoan.findOne({ where: { id: loanId } });
        await loan.update({ returned_time: returnedTime });
        const book = await Book.findOne({ where: { id: bookId } });
        await book.update({ quantity: book.get().quantity + 1 });
        const data = { isSuccessful: true, message: successMessages.SUCCESSFULLY_RETURNED_BOOK };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
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
            { model: Book, where: bookCondition },
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

exports.loanBook = async (req: Request, res: Response) => {
    const studentTReader = req.body.studentTicketReader;
    const librarianEmail = req.body.librarianEmail;
    const bookId = req.body.bookId;
    const loanTime = req.body.time;

    if (!req.body) {
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        const student = await Student.findOne({
            where: {
                reader_ticket: studentTReader
            }
        });

        if (!student) {
            return responseErrorHandle(res, 400, errorMessages.USER_EMAIL_EXISTS);
        }

        const librarian = await Librarian.findOne({
            where: { email: librarianEmail },
            include: { model: Department }
        });
        const book = await Book.findOne({ where: { id: bookId } });

        if (book.get().quantity <= 0) {
            return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
        } else {
            const bookLoan = new SequelizeLoan({
                loan_time: loanTime,
                studentId: student.get().id,
                bookId,
                librarianId: librarian.get().id,
                departmentId: librarian.get().department_.get().id
            });
            await bookLoan.save();
            await book.update({ quantity: book.get().quantity - 1 });

            const data = { isSuccessful: true, message: successMessages.SUCCESSFULLY_LOANED };
            responseSuccessHandle(res, 200, data);
        }
    } catch (error) {
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};
