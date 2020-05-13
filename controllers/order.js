const Order = require('../models/order');
const Loan = require('../models/loan');
const Author = require('../models/author');
const Student = require('../models/student');
const Librarian = require('../models/librarian');
const Book = require('../models/book');
const Department = require('../models/department');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: Student
                },
                {
                    model: Book,
                    include: {
                        model: Author
                    }
                },
                { model: Department }
            ]
        });
        const ordersArr = [];
        for (const order of orders) {
            const ordersValues = order.dataValues;
            const studentData = ordersValues.student_.dataValues;
            const departmentData = ordersValues.department_.dataValues;
            const bookData = ordersValues.book_.dataValues;
            const ordersObj = {
                id: ordersValues.id,
                orderTime: ordersValues.order_time,
                loanTime: ordersValues.loan_time,
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
                        name: bookData.author_.dataValues.name
                    }
                },
                bookISBN: bookData.isbn,
                studentReaderTicket: studentData.reader_ticket,
                departmentAddress: departmentData.address
            };
            ordersArr.push(ordersObj);
        }
        const data = {
            orders: ordersArr,
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
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
        const bookOrder = new Order({
            order_time: orderTime,
            studentId: student.dataValues.id,
            bookId: bookId,
            departmentId: book.dataValues.department_.dataValues.id
        });
        await bookOrder.save();
        await book.update({ quantity: book.dataValues.quantity - 1 });

        const data = {
            isSuccessful: true,
            message: successMessages.SUCCESSFULLY_ORDERED
        };

        helper.responseHandle(res, 200, data);
    } catch (error) {
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
            librarianId: librarian.dataValues.id,
            departmentId: book.dataValues.departmentId
        });
        const data = {
            isSuccessful: true,
            message: successMessages.SUCCESSFULLY_LOANED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
