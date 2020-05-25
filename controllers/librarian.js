const Librarian = require('../models/librarian');
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

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const models = require('../constants/models');

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

exports.getLibrarians = async (req, res) => {
    const librarians = await Librarian.findAll({
        include: { model: Department }
    });
    const librariansArr = [];
    try {
        for (const librarian of librarians) {
            const librarianValues = librarian.get();
            const librarianRole = await getLibrarianRole(librarianValues.id);
            if (librarianRole === roles.LIBRARIAN) {
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
                    departmentAddress: librarianValues.department_.get()
                        .address,
                    schedule: librarianSchedule
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

        const newLibrarian = await Librarian.create({
            name: name,
            email: email,
            departmentId: departmentId,
            password: passwordGenerator.generatePassword()
        });
        await Role.create({
            librarian_id: newLibrarian.get().id,
            role: roles.LIBRARIAN
        });
        const data = {
            isSuccessful: true,
            message: successMessages.LIBRARIAN_SUCCESSFULLY_CREATED
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 400, err);
    }
};
