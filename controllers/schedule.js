const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Schedule = require('../models/schedule');
const Period = require('../models/period');
const Librarian = require('../models/librarian');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const days = require('../constants/days');

const getScheduleByDay = (schedules, day) => {
    return schedules.filter(sch => sch.day === day);
};

exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.findAll({
            include: [{ model: Period }, { model: Librarian }]
        });
        let schedulesArr = [];
        schedules.forEach(schedule => {
            schedulesArr.push({
                id: schedule.dataValues.id,
                day: schedule.dataValues.day,
                period: schedule.period_.get(),
                librarian: schedule.librarian_.get()
            });
        });
        const data = {
            schedules: schedulesArr,
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
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
            return helper.responseHandle(res, 200, data);
        }
    } catch (error) {
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
        const checkUniqueness = await Schedule.findOne({
            where: {
                day: day,
                periodId: periodId,
                librarianId: librarianId,
                id: { [Op.ne]: scheduleId }
            }
        });
        if (checkUniqueness) {
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
            return helper.responseHandle(res, 200, data);
        }
    } catch (error) {
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
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        return helper.responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
