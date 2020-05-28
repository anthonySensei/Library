const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Student = require('../models/student');
const Department = require('../models/department');
const Order = require('../models/order');
const Book = require('../models/book');
const Librarian = require('../models/librarian');

const helper = require('../helper/responseHandle');
const imageHandler = require('../helper/imageHandle');
const checkUniqueness = require('../helper/checkUniqueness');
const passwordGenerator = require('../helper/generatePassword');
const mailSender = require('../helper/mailSender');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const mailMessages = require('../constants/mailMessages');

const loanController = require('./loan');

const models = require('../constants/models');
const roles = require('../constants/roles');
const statuses = require('../constants/userStatuses');
const filters = require('../constants/filters');

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
                const orderValues = order.get();
                ordersArr.push({
                    orderTime: orderValues.order_time,
                    bookISBN: orderValues.book_.get().isbn,
                    departmentAddress: orderValues.department_.get().address
                });
            });
            return ordersArr;
        }
        return null;
    } catch (error) {
        return null;
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        const studentsArr = [];
        students.forEach(student => {
            const studentValues = student.get();
            if (studentValues.profile_image) {
                studentValues.profile_image = imageHandler.convertToBase64(
                    studentValues.profile_image
                );
            } else {
                studentValues.profile_image = '';
            }
            const studentData = {
                id: studentValues.id,
                name: studentValues.name,
                email: studentValues.email,
                readerTicket: studentValues.reader_ticket
            };
            studentsArr.push(studentData);
        });
        const data = {
            message: successMessages.SUCCESSFULLY_FETCHED,
            students: studentsArr
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.getStudents = async (req, res) => {
    const page = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;
    const sortOrder = req.query.sortOrder.toUpperCase();
    const filterName = req.query.filterName;
    const filterValue = req.query.filterValue;
    let filterCondition = {};

    const like = { [Op.iLike]: `%${filterValue}%` };
    if (filterName === filters.EMAIL) filterCondition = { email: like };
    else if (filterName === filters.NAME) filterCondition = { name: like };
    else if (filterName === filters.READER_TICKET)
        filterCondition = { reader_ticket: like };

    try {
        const quantityOfLibrarians = await Student.count({
            where: filterCondition
        });
        const students = await Student.findAll({
            where: filterCondition,
            limit: pageSize,
            order: [['name', sortOrder]],
            offset: (page - 1) * pageSize
        });
        const studentsArr = [];
        students.forEach(student => {
            const studentValues = student.get();
            if (studentValues.profile_image) {
                studentValues.profile_image = imageHandler.convertToBase64(
                    studentValues.profile_image
                );
            } else {
                studentValues.profile_image = '';
            }
            const studentData = {
                id: studentValues.id,
                name: studentValues.name,
                email: studentValues.email,
                profileImage: studentValues.profile_image,
                readerTicket: studentValues.reader_ticket,
                status: studentValues.status
            };
            studentsArr.push(studentData);
        });
        const data = {
            message: successMessages.SUCCESSFULLY_FETCHED,
            students: studentsArr,
            quantity: quantityOfLibrarians
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
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
        const studentValues = student.get();
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
        const isNotUniqueLibrarianEmail = await Librarian.findOne({
            where: { email: studentEmail }
        });
        if (isNotUniqueLibrarianEmail) {
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
            );
        } else {
            const isNotUniqueStudentEmail = await Student.findOne({
                where: { email: studentEmail, id: { [Op.ne]: studentId } }
            });
            if (isNotUniqueStudentEmail) {
                return helper.responseErrorHandle(
                    res,
                    400,
                    errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
                );
            } else {
                const isNotUniqueReaderTicket = await Student.findOne({
                    where: {
                        reader_ticket: studentReaderTicket,
                        id: { [Op.ne]: studentId }
                    }
                });
                if (isNotUniqueReaderTicket) {
                    return helper.responseErrorHandle(
                        res,
                        400,
                        errorMessages.READER_TICKET_ALREADY_IN_USE
                    );
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
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
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
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
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
    } catch (err) {
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
            password: password.encrypted
        });
    }

    try {
        await newStudent.save();
        if (registrationToken)
            await mailSender.sendMail(
                email,
                mailMessages.subjects.ACCOUNT_ACTIVATION,
                mailMessages.generateActivationMessage(registrationToken)
            );
        else
            await mailSender.sendMail(
                email,
                mailMessages.subjects.ACCOUNT_CREATED,
                mailMessages.generatePasswordMessage(email, password.password)
            );
        const data = {
            isSuccessful: true,
            message: successMessages.ACCOUNT_SUCCESSFULLY_CREATED
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.createStudent = createStudent;
