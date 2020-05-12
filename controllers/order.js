const Order = require('../models/order');
const Student = require('../models/student');
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
                { model: Book },
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
                orderTime: ordersValues.order_time,
                student: {
                    name: studentData.name,
                    email: studentData.email,
                    readerTicket: studentData.reader_ticket
                },
                department: {
                    address: departmentData.address
                },
                book: {
                    isbn: bookData.isbn,
                    name: bookData.name,
                    year: bookData.year,
                    author: bookData.author
                }
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
