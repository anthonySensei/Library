const Librarian = require('../models/librarian');
const Department = require('../models/department');
const Role = require('../models/role');
const Schedule = require('../models/schedule');

const loanController = require('./loan');

const roles = require('../constants/roles');

const helper = require('../helper/responseHandle');
const passwordGenerator = require('../helper/generatePassword');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const models = require('../constants/models');

const getLibrarianRole = async librarianId => {
    try {
        const role = await Role.findOne({
            where: { librarian_id: librarianId }
        });
        return role.dataValues.role;
    } catch (error) {
        return null;
    }
};

const getLibrarianSchedule = async librarianId => {
    try {
        const schedules = await Schedule.findAll({
            where: { librarianId: librarianId }
        });
        const scheduleArr = [];
        if (schedules.length > 0) {
            schedules.forEach(schedule => {
                const scheduleValues = schedule.dataValues;
                scheduleArr.push({
                    day: scheduleValues.dayOfWeek,
                    start: scheduleValues.start_time,
                    end: scheduleValues.end_time
                });
            });
            return scheduleArr;
        }
        return [];
    } catch (error) {
        return [];
    }
};

exports.getLibrarians = async (req, res) => {
    const librarians = await Librarian.findAll({
        include: { model: Department }
    });
    const librariansArr = [];
    for (const librarian of librarians) {
        const librarianValues = librarian.dataValues;
        try {
            const librarianRole = await getLibrarianRole(librarianValues.id);
            if (librarianRole === roles.LIBRARIAN) {
                if (librarianValues.profile_image) {
                    librarianValues.profile_image = base64Img.base64Sync(
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
                    departmentAddress:
                        librarianValues.department_.dataValues.address,
                    schedule: librarianSchedule
                };
                librariansArr.push(librarianData);
            }
        } catch (error) {
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.SOMETHING_WENT_WRONG
            );
        }
    }
    const data = {
        message: successMessages.SUCCESSFULLY_FETCHED,
        librarians: librariansArr
    };
    return helper.responseHandle(res, 200, data);
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
        const librarianValues = librarian.dataValues;
        if (librarianValues.profile_image) {
            librarianValues.profile_image = base64Img.base64Sync(
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
                address: librarianValues.department_.dataValues.address
            },
            schedule: librarianSchedule,
            loans: librarianLoans,
            statistic: librarianStatistic
        };
        console.log(librarianData);
        const data = {
            message: successMessages.SUCCESSFULLY_FETCHED,
            librarian: librarianData
        };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        console.log(err);
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
        const librarian = await Librarian.findOne({
            where: {
                email: email
            }
        });
        if (librarian) {
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
