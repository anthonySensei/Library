import { Request, Response } from 'express';

import Schedule from '../schemas/schedule';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

import { responseErrorHandle, responseSuccessHandle } from '../helper/response';

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
