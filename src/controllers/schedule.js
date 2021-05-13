const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Schedule = require('../schemas/schedule');
const Period = require('../schemas/period');
const Librarian = require('../schemas/librarian');
const Department = require('../schemas/sdepartment');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.findAll({
            include: [
                { model: Period },
                { model: Librarian, include: { model: Department } }
            ]
        });
        let schedulesArr = [];
        schedules.forEach(schedule => {
            schedulesArr.push({
                id: schedule.get().id,
                day: schedule.get().day,
                period: schedule.period_.get(),
                librarian: schedule.librarian_.get()
            });
        });
        const data = {
            schedules: schedulesArr,
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        return helper.responseSuccessHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.addSchedule = async (req, res) => {
    const day = req.body.schedule.day;
    const periodId = req.body.schedule.period.id;
    const librarianId = req.body.schedule.librarian.id;
    try {
        const isNotUnique = await Schedule.findOne({
            where: { day: day, periodId: periodId, librarianId: librarianId }
        });
        if (isNotUnique) {
            return helper.responseErrorHandle(
                res,
                500,
                errorMessages.PERIOD_EXIST
            );
        } else {
            await Schedule.create({
                day: day,
                periodId: periodId,
                librarianId: librarianId
            });
            const data = {
                isSuccessful: true,
                message: successMessages.SCHEDULE_SUCCESSFULLY_CREATED
            };
            return helper.responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.editSchedule = async (req, res) => {
    const scheduleId = req.body.schedule.id;
    const day = req.body.schedule.day;
    const periodId = req.body.schedule.period.id;
    const librarianId = req.body.schedule.librarian.id;
    try {
        const isNotUnique = await Schedule.findOne({
            where: {
                day: day,
                periodId: periodId,
                librarianId: librarianId,
                id: { [Op.ne]: scheduleId }
            }
        });
        if (isNotUnique) {
            return helper.responseErrorHandle(
                res,
                500,
                errorMessages.SCHEDULE_EXIST
            );
        } else {
            const schedule = await Schedule.findOne({
                where: { id: scheduleId }
            });
            await schedule.update({
                day: day,
                periodId: periodId,
                librarianId: librarianId
            });
            const data = {
                isSuccessful: true,
                message: successMessages.SCHEDULE_SUCCESSFULLY_UPDATED
            };
            return helper.responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.deleteSchedule = async (req, res) => {
    const scheduleId = req.query.scheduleId;
    try {
        const schedule = await Schedule.findOne({ where: { id: scheduleId } });
        await schedule.destroy();
        const data = {
            isSuccessful: true,
            message: successMessages.SCHEDULE_SUCCESSFULLY_DELETED
        };
        return helper.responseSuccessHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
