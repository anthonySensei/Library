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

const getCondition = (departmentId, loanDate, nextDay, isShowNotLoaned) => {
    let departmentCondition = {};
    let dateCondition = {};
    let isShowNotLoanedCondition = {};

    if (departmentId) departmentCondition = { departmentId: departmentId };
    if (loanDate)
        dateCondition = {
            loan_time: {
                [Op.between]: [loanDate, nextDay]
            }
        };
    if (isShowNotLoaned === 'true')
        isShowNotLoanedCondition = {
            loan_time: null
        };

    return {
        ...departmentCondition,
        ...dateCondition,
        ...isShowNotLoanedCondition
    };
};

exports.getAllOrders = async (req, res) => {
    const page = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;
    const sortOrder = req.query.sortOrder.toUpperCase();
    const filterName = req.query.filterName;
    const filterValue = req.query.filterValue;
    const departmentId = +req.query.departmentId;
    const orderDate = req.query.orderDate;
    const nextDay = req.query.nextDay;
    const isShowNotLoaned = req.query.isShowNotLoaned;
    const studentId = +req.query.studentId;
    let studentCondition = {};
    let bookCondition = {};

    const like = { [Op.iLike]: `%${filterValue}%` };
    if (filterName === filters.READER_TICKET)
        studentCondition = { reader_ticket: like };
    else if (filterName === filters.ISBN) bookCondition = { isbn: like };

    if (studentId) studentCondition = { id: studentId };

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
        const orders = await Order.findAll({
            include: includeArr,
            where: getCondition(
                departmentId,
                orderDate,
                nextDay,
                isShowNotLoaned
            ),
            limit: pageSize,
            order: [['order_time', sortOrder]],
            offset: (page - 1) * pageSize
        });
        const ordersArr = [];
        for (const order of orders) {
            const ordersValues = order.get();
            const studentData = ordersValues.student_.get();
            const departmentData = ordersValues.department_.get();
            const bookData = ordersValues.book_.get();
            let ordersObj = {
                id: ordersValues.id,
                orderTime: ordersValues.order_time,
                loanTime: ordersValues.loan_time,
                bookISBN: bookData.isbn,
                departmentAddress: departmentData.address
            };
            if (!studentId)
                ordersObj = {
                    ...ordersObj,
                    student: {
                        id: studentData.id,
                        name: studentData.name,
                        email: studentData.email,
                        readerTicket: studentData.reader_ticket
                    },
                    department: {
                        address: departmentData.address
                    },
                    book: {
                        bookId: bookData.id,
                        isbn: bookData.isbn,
                        name: bookData.name,
                        year: bookData.year,
                        author: {
                            name: bookData.author_.get().name
                        }
                    },
                    studentReaderTicket: studentData.reader_ticket
                };
            ordersArr.push(ordersObj);
        }
        const data = {
            orders: ordersArr,
            message: successMessages.SUCCESSFULLY_FETCHED,
            quantity: quantity
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.orderBook = async (req, res) => {
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
                errorMessages.STUDENT_WITH_THIS_READER_TICKET_DOESNT_EXIST
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
                bookId: bookId,
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
        helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.loanBookFromOrder = async (req, res) => {
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
            bookId: bookId,
            studentId: studentId,
            librarianId: librarian.get().id,
            departmentId: book.get().departmentId
        });
        const data = {
            isSuccessful: true,
            message: successMessages.SUCCESSFULLY_LOANED
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
