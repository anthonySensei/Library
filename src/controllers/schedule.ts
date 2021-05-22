import { Request, Response } from 'express';

import Schedule from '../schemas/schedule';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

import { responseErrorHandle, responseSuccessHandle } from '../helper/response';

const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const SequelizeSchedule = require('../schemas/sschedule');

export const getSchedules = async (req: Request, res: Response) => {
    try {
        const schedules = await Schedule.find().populate('librarian', '-password');
        const data = {
            schedules: schedules.map(schedule => schedule.toJSON()),
            message: successMessages.SUCCESSFULLY_FETCHED
        };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

exports.addSchedule = async (req: Request, res: Response) => {
    const day = req.body.schedule.day;
    const librarianId = req.body.schedule.librarian.id;
    try {
        const isNotUnique = await SequelizeSchedule.findOne({
            where: { day, librarianId }
        });
        if (isNotUnique) {
            return responseErrorHandle(
                res,
                500,
                ``
            );
        } else {
            await SequelizeSchedule.create({
                day,
                librarianId
            });
            const data = {
                isSuccessful: true,
                message: successMessages.SCHEDULE_SUCCESSFULLY_CREATED
            };
            return responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        return responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.editSchedule = async (req: Request, res: Response) => {
    const scheduleId = req.body.schedule.id;
    const day = req.body.schedule.day;
    const librarianId = req.body.schedule.librarian.id;
    try {
        const isNotUnique = await SequelizeSchedule.findOne({
            where: {
                day,
                librarianId,
                id: { [Op.ne]: scheduleId }
            }
        });
        if (isNotUnique) {
            return responseErrorHandle(
                res,
                500,
                errorMessages.SCHEDULE_EXIST
            );
        } else {
            const schedule = await SequelizeSchedule.findOne({
                where: { id: scheduleId }
            });
            await schedule.update({
                day,
                librarianId
            });
            const data = {
                isSuccessful: true,
                message: successMessages.SCHEDULE_SUCCESSFULLY_UPDATED
            };
            return responseSuccessHandle(res, 200, data);
        }
    } catch (err) {
        return responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

exports.deleteSchedule = async (req: Request, res: Response) => {
    const scheduleId = req.query.scheduleId;
    try {
        const schedule = await SequelizeSchedule.findOne({ where: { id: scheduleId } });
        await schedule.destroy();
        const data = {
            isSuccessful: true,
            message: successMessages.SCHEDULE_SUCCESSFULLY_DELETED
        };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(
            res,
            500,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
