const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Student = require('../models/student');
const Department = require('../models/department');
const Order = require('../models/order');
const Book = require('../models/book');
const Librarian = require('../models/librarian');

const helper = require('../helper/responseHandle');
const checkUniqueness = require('../helper/checkUniqueness');
const passwordGenerator = require('../helper/generatePassword');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

const loanController = require('./loan');

const models = require('../constants/models');
const roles = require('../constants/roles');
const statuses = require('../constants/userStatuses');

const getStudentOrders = async studentId => {
    try {
        const orders = await Order.findAll({
            where: {
                studentId: studentId
            },
            include: [
                {
                    model: Book
                },
                { model: Department }
            ]
        });
        const ordersArr = [];
        if (orders.length > 0) {
            orders.forEach(order => {
                const orderValues = order.dataValues;
                ordersArr.push({
                    orderTime: orderValues.order_time,
                    bookISBN: orderValues.book_.dataValues.isbn,
                    departmentAddress:
                        orderValues.department_.dataValues.address
                });
            });
            return ordersArr;
        }
        return null;
    } catch (error) {
        return null;
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        const studentsArr = [];
        students.forEach(student => {
            if (student.dataValues.profile_image) {
                student.dataValues.profile_image = base64Img.base64Sync(
                    student.dataValues.profile_image
                );
            } else {
                student.dataValues.profile_image = '';
            }
            const studentData = {
                id: student.dataValues.id,
                name: student.dataValues.name,
                email: student.dataValues.email,
                profileImage: student.dataValues.profile_image,
                readerTicket: student.dataValues.reader_ticket,
                status: student.dataValues.status
            };
            studentsArr.push(studentData);
        });
        const data = {
            message: successMessages.SUCCESSFULLY_FETCHED,
            students: studentsArr
        };
        return helper.responseHandle(res, 200, data);
    } catch (e) {
        return helper.responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.getStudent = async (req, res) => {
    const studentId = req.query.studentId;
    try {
        const student = await Student.findOne({
            where: {
                id: studentId
            }
        });
        const studentValues = student.dataValues;
        const studentLoans = await loanController.getLoans(
            studentValues.id,
            models.STUDENT
        );
        const studentStatistic = await loanController.getLoanStatistic(
            studentLoans
        );
        const studentOrders = await getStudentOrders(studentValues.id);
        const studentData = {
            name: studentValues.name,
            email: studentValues.email,
            profileImage: studentValues.profile_image,
            readerTicket: studentValues.reader_ticket,
            status: studentValues.status,
            loans: studentLoans,
            statistic: studentStatistic,
            orders: studentOrders
        };
        const data = {
            message: successMessages.SUCCESSFULLY_FETCHED,
            student: studentData
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        return helper.responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.editStudent = async (req, res) => {
    const studentEmail = req.body.email;
    const studentId = req.body.studentId;
    const studentReaderTicket = req.body.readerTicket;
    try {
        const checkEmailInLibrarians = await Librarian.findOne({
            where: { email: studentEmail }
        });
        if (checkEmailInLibrarians) {
            const data = {
                isSuccessful: false,
                message: errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
            };
            return helper.responseHandle(res, 400, data);
        } else {
            const checkEmailInStudents = await Student.findOne({
                where: { email: studentEmail, id: { [Op.ne]: studentId } }
            });
            if (checkEmailInStudents) {
                const data = {
                    isSuccessful: false,
                    message: errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
                };
                return helper.responseHandle(res, 400, data);
            } else {
                const checkReaderTicket = await Student.findOne({
                    where: {
                        reader_ticket: studentReaderTicket,
                        id: { [Op.ne]: studentId }
                    }
                });
                if (checkReaderTicket) {
                    const data = {
                        isSuccessful: false,
                        message: errorMessages.READER_TICKET_ALREADY_IN_USE
                    };
                    return helper.responseHandle(res, 400, data);
                } else {
                    const student = await Student.findOne({
                        where: { id: studentId }
                    });
                    await student.update({
                        email: studentEmail,
                        reader_ticket: studentReaderTicket
                    });
                    const data = {
                        isSuccessful: true,
                        message: successMessages.STUDENT_SUCCESSFULLY_UPDATED
                    };
                    return helper.responseHandle(res, 200, data);
                }
            }
        }
    } catch (error) {
        const data = {
            isSuccessful: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 500, data);
    }
};

exports.deleteStudent = async (req, res) => {
    const studentId = req.query.studentId;
    try {
        const student = await Student.findOne({ where: { id: studentId } });
        await student.destroy();
        const data = {
            isSuccessful: true,
            message: successMessages.STUDENT_SUCCESSFULLY_DELETED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        const data = {
            isSuccessful: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 500, data);
    }
};

exports.addStudent = async (req, res) => {
    const email = req.body.email;
    const readerTicket = req.body.readerTicket;
    const name = req.body.name;
    if (!email || !readerTicket || !name)
        return helper.responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    try {
        const isNotUniqueReaderTicket = await checkUniqueness.checkReaderTicket(
            readerTicket
        );
        if (isNotUniqueReaderTicket) {
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.READER_TICKET_ALREADY_IN_USE
            );
        }
        const isNotUniqueEmail = await checkUniqueness.checkEmail(email);
        if (isNotUniqueEmail) {
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
            );
        }
        await createStudent(
            roles.STUDENT,
            email,
            name,
            readerTicket,
            null,
            passwordGenerator.generatePassword(),
            statuses.ACTIVATED,
            res
        );
    } catch (error) {
        return helper.responseErrorHandle(
            res,
            5000,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

const createStudent = async (
    userRole,
    email,
    name,
    readerTicket,
    registrationToken,
    password,
    status,
    res
) => {
    let newStudent;
    if (registrationToken) {
        newStudent = new Student({
            email: email,
            name: name,
            reader_ticket: readerTicket,
            registration_token: registrationToken,
            status: status,
            password: password
        });
    } else {
        newStudent = new Student({
            email: email,
            name: name,
            reader_ticket: readerTicket,
            status: status,
            password: password
        });
    }

    try {
        await newStudent.save();
        const data = {
            isSuccessful: true,
            message: successMessages.ACCOUNT_SUCCESSFULLY_CREATED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.createStudent = createStudent;
