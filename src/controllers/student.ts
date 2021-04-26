import { Request, Response } from 'express';
import User from '../schemas/user';
import { UserModel } from '../models/user';
import logger from '../config/logger';

const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Student = require('../schemas/student');
const Department = require('../schemas/department');
const Order = require('../schemas/order');
const Book = require('../schemas/book');
const Librarian = require('../schemas/librarian');

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

const getStudentOrders = async (studentId: number) => {
    try {
        const orders = await Order.findAll({
            where: {
                studentId
            },
            include: [
                {
                    model: Book
                },
                { model: Department }
            ]
        });
        const ordersArr: any = [];
        if (orders.length > 0) {
            orders.forEach((order: any) => {
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

exports.getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await Student.findAll();
        const studentsArr: any = [];
        students.forEach((student: any) => {
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

exports.getStudents = async (req: Request, res: Response) => {
    const { pageNumber: page, pageSize, sortOrder, filterName, filterValue } = req.query;
    let filterCondition = {};

    const like = { [Op.iLike]: `%${filterValue}%` };

    if (filterName === filters.EMAIL) {
        filterCondition = { email: like };
    } else if (filterName === filters.NAME) {
        filterCondition = { name: like };
    } else if (filterName === filters.READER_TICKET) {
        filterCondition = { reader_ticket: like };
    }

    filterCondition = { ...filterCondition, admin: false, librarian: false };

    try {
        const studentQuantity = await User.countDocuments(filterCondition);
        const studentsDb = await User.find(filterCondition, {}, {
            limit: Number(pageSize),
            sort: { name: String(sortOrder) === 'asc' ? -1 : 1 },
            skip: (Number(page) - 1) * Number(pageSize)
        }) as UserModel[];

        const students: any = studentsDb.map(student => ({
            id: student._id,
            name: student.name,
            email: student.email,
            image: student.image
        }));
        const data = {
            students,
            message: successMessages.SUCCESSFULLY_FETCHED,
            quantity: studentQuantity,
            success: true
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        logger.error('Error fetching users', err.message);
        return helper.responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.getStudent = async (req: Request, res: Response) => {
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
            profileImage: imageHandler.convertToBase64(studentValues.profile_image),
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

exports.editStudent = async (req: Request, res: Response) => {
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

exports.deleteStudent = async (req: Request, res: Response) => {
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

exports.addStudent = async (req: Request, res: Response) => {
    const email = req.body.email;
    const readerTicket = req.body.readerTicket;
    const name = req.body.name;
    if (!email || !readerTicket || !name) {
        return helper.responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }
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
    userRole: string,
    email: string,
    name: string,
    readerTicket: string,
    registrationToken: string | null,
    password: any,
    status: string,
    res: Response
) => {
    let newStudent;
    if (registrationToken) {
        newStudent = new Student({
            email,
            name,
            reader_ticket: readerTicket,
            registration_token: registrationToken,
            status,
            password
        });
    } else {
        newStudent = new Student({
            email,
            name,
            reader_ticket: readerTicket,
            status,
            password: password.encrypted
        });
    }

    try {
        await newStudent.save();
        if (registrationToken) {
            await mailSender.sendMail(
                email,
                mailMessages.subjects.ACCOUNT_ACTIVATION,
                mailMessages.generateActivationMessage(registrationToken)
            );
        } else {
            await mailSender.sendMail(
                email,
                mailMessages.subjects.ACCOUNT_CREATED,
                mailMessages.generatePasswordMessage(email, password.password)
            );
        }
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
