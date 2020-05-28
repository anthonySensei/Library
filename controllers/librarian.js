const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Librarian = require('../models/librarian');
const Student = require('../models/student');
const Department = require('../models/department');
const Role = require('../models/role');
const Schedule = require('../models/schedule');
const Period = require('../models/period');

const loanController = require('./loan');

const roles = require('../constants/roles');

const helper = require('../helper/responseHandle');
const imageHandler = require('../helper/imageHandle');
const passwordGenerator = require('../helper/generatePassword');
const checkUniqueness = require('../helper/checkUniqueness');
const mailSender = require('../helper/mailSender');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const models = require('../constants/models');
const filters = require('../constants/filters');
const mailMessages = require('../constants/mailMessages');

const getLibrarianRole = async librarianId => {
    try {
        const role = await Role.findOne({
            where: { librarian_id: librarianId }
        });
        return role.get().role;
    } catch (err) {
        return null;
    }
};

const getLibrarianSchedule = async librarianId => {
    try {
        const schedules = await Schedule.findAll({
            where: { librarianId: librarianId },
            include: { model: Period }
        });
        const scheduleArr = [];
        if (schedules.length > 0) {
            schedules.forEach(schedule => {
                const scheduleValues = schedule.get();
                scheduleArr.push({
                    day: scheduleValues.day,
                    period: scheduleValues.period_.get()
                });
            });
            return scheduleArr;
        }
        return [];
    } catch (err) {
        return [];
    }
};

exports.getAllLibrarians = async (req, res) => {
    const librarians = await Librarian.findAll({
        include: { model: Department }
    });
    const librariansArr = [];
    try {
        for (const librarian of librarians) {
            const librarianValues = librarian.get();
            const librarianRole = await getLibrarianRole(librarianValues.id);
            if (librarianRole === roles.LIBRARIAN) {
                const librarianData = {
                    id: librarianValues.id,
                    name: librarianValues.name,
                    email: librarianValues.email,
                    departmentAddress: librarianValues.department_.get()
                        .address,
                    department: {
                        id: librarianValues.department_.get().id,
                        address: librarianValues.department_.get().address
                    }
                };
                librariansArr.push(librarianData);
            }
        }
        const data = {
            message: successMessages.SUCCESSFULLY_FETCHED,
            librarians: librariansArr
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

exports.getLibrarians = async (req, res) => {
    const page = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;
    const sortOrder = req.query.sortOrder.toUpperCase();
    const filterName = req.query.filterName;
    const filterValue = req.query.filterValue;
    const departmentId = +req.query.departmentId;
    let filterCondition = {};
    let departmentCondition = {};

    const like = { [Op.iLike]: `%${filterValue}%` };
    if (filterName === filters.EMAIL) filterCondition = { email: like };
    else if (filterName === filters.NAME) filterCondition = { name: like };
    if (departmentId > 0) departmentCondition = { departmentId: departmentId };

    try {
        const role = await Role.findOne({
            where: { role: roles.MANAGER }
        });
        const checkIsNotManager = {
            id: {
                [Op.ne]: role.get().librarian_id
            }
        };
        const quantityOfLibrarians = await Librarian.count({
            where: {
                ...checkIsNotManager,
                ...filterCondition,
                ...departmentCondition
            }
        });
        const librarians = await Librarian.findAll({
            where: {
                ...checkIsNotManager,
                ...filterCondition,
                ...departmentCondition
            },
            include: { model: Department },
            limit: pageSize,
            order: [['name', sortOrder]],
            offset: (page - 1) * pageSize
        });
        const librariansArr = [];
        for (const librarian of librarians) {
            const librarianValues = librarian.get();
            if (librarianValues.profile_image) {
                librarianValues.profile_image = imageHandler.convertToBase64(
                    librarianValues.profile_image
                );
            } else {
                librarianValues.profile_image = '';
            }
            const librarianSchedule = await getLibrarianSchedule(
                librarianValues.id
            );
            const librarianData = {
                id: librarianValues.id,
                name: librarianValues.name,
                email: librarianValues.email,
                profileImage: librarianValues.profile_image,
                departmentAddress: librarianValues.department_.get().address,
                schedule: librarianSchedule
            };
            librariansArr.push(librarianData);
        }
        const data = {
            message: successMessages.SUCCESSFULLY_FETCHED,
            librarians: librariansArr,
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

exports.getLibrarian = async (req, res) => {
    const librarianId = req.query.librarianId;
    try {
        const librarian = await Librarian.findOne({
            where: {
                id: librarianId
            },
            include: { model: Department }
        });
        const librarianValues = librarian.get();
        if (librarianValues.profile_image) {
            librarianValues.profile_image = imageHandler.convertToBase64(
                librarianValues.profile_image
            );
        } else {
            librarianValues.profile_image = '';
        }
        const librarianSchedule = await getLibrarianSchedule(
            librarianValues.id
        );
        const librarianLoans = await loanController.getLoans(
            librarianValues.id,
            models.LIBRARIAN
        );
        const librarianStatistic = await loanController.getLoanStatistic(
            librarianLoans
        );
        const librarianData = {
            id: librarianValues.id,
            name: librarianValues.name,
            email: librarianValues.email,
            profileImage: librarianValues.profile_image,
            department: {
                address: librarianValues.department_.get().address
            },
            schedule: librarianSchedule,
            loans: librarianLoans,
            statistic: librarianStatistic
        };
        const data = {
            message: successMessages.SUCCESSFULLY_FETCHED,
            librarian: librarianData
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 400, err);
    }
};

exports.addLibrarian = async (req, res) => {
    const email = req.body.email;
    const departmentId = req.body.departmentId;
    const name = req.body.name;

    if (!email || !departmentId || !name)
        return helper.responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);

    try {
        const isNotUnique = await checkUniqueness.checkEmail(email);
        if (isNotUnique) {
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
            );
        }

        const passwordObj = passwordGenerator.generatePassword();

        const newLibrarian = await Librarian.create({
            name: name,
            email: email,
            departmentId: departmentId,
            password: passwordObj.encrypted
        });
        await Role.create({
            librarian_id: newLibrarian.get().id,
            role: roles.LIBRARIAN
        });
        await mailSender.sendMail(
            email,
            mailMessages.subjects.ACCOUNT_CREATED,
            mailMessages.generatePasswordMessage(email, passwordObj.password)
        );
        const data = {
            isSuccessful: true,
            message: successMessages.LIBRARIAN_SUCCESSFULLY_CREATED
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 400, err);
    }
};

exports.editLibrarian = async (req, res) => {
    const librarianEmail = req.body.email;
    const librarianId = req.body.librarianId;
    const departmentId = req.body.departmentId;
    try {
        const isNotUniqueLibrarianEmail = await Librarian.findOne({
            where: { email: librarianEmail, id: { [Op.ne]: librarianId } }
        });
        if (isNotUniqueLibrarianEmail) {
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
            );
        } else {
            const isNotUniqueStudentEmail = await Student.findOne({
                where: { email: librarianEmail }
            });
            if (isNotUniqueStudentEmail) {
                return helper.responseErrorHandle(
                    res,
                    400,
                    errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
                );
            } else {
                const librarian = await Librarian.findOne({
                    where: { id: librarianId }
                });
                await librarian.update({
                    email: librarianEmail,
                    departmentId: departmentId
                });
                const data = {
                    isSuccessful: true,
                    message: successMessages.LIBRARIAN_SUCCESSFULLY_UPDATED
                };
                return helper.responseHandle(res, 200, data);
            }
        }
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.deleteLibrarian = async (req, res) => {
    const librarianId = req.query.librarianId;
    try {
        const role = await Role.findOne({
            where: { librarian_id: librarianId }
        });
        role.destroy();
        const librarian = await Librarian.findOne({
            where: { id: librarianId }
        });
        await librarian.destroy();
        const data = {
            isSuccessful: true,
            message: successMessages.LIBRARIAN_SUCCESSFULLY_DELETED
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
