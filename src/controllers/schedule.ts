import {Request, Response} from 'express';

import Schedule from '../schemas/schedule';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

import {responseErrorHandle, responseSuccessHandle} from '../helper/response';
import {removedEmptyFields} from '../helper/object';

export const getSchedules = async (req: Request, res: Response) => {
    try {
        const { librarianId } = req.query;
        const filter = removedEmptyFields({ librarian: librarianId });
        const schedules = await Schedule.find(filter).populate('librarian', '-password');
        const data = { schedules: schedules.map(schedule => schedule.toJSON()), message: successMessages.SUCCESSFULLY_FETCHED };
        responseSuccessHandle(res, 200, data);
    } catch (err) {
        responseErrorHandle(res, 500, errorMessages.CANNOT_FETCH);
    }
};

export const addSchedule = async (req: Request, res: Response) => {
    const { schedule } = req.body;

    try {
        const isExist = await Schedule.findOne({ librarian: schedule.librarian });

        if (isExist) {
            return responseErrorHandle(res, 500, errorMessages.SCHEDULE_EXIST);
        }

        await Schedule.create(schedule);
        responseSuccessHandle(res, 201, { message: successMessages.SCHEDULE_SUCCESSFULLY_CREATED });
    } catch (err) {
        responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const editSchedule = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { schedule } = req.body;

    try {
        const isExist = !!(await Schedule.findOne({ librarian: schedule.librarian, _id: { $ne: id } }));

        if (isExist) {
            return responseErrorHandle(res, 400, errorMessages.SCHEDULE_EXIST);
        }

        await Schedule.findByIdAndUpdate(id, schedule);
        responseSuccessHandle(res, 200, { message: successMessages.SCHEDULE_SUCCESSFULLY_UPDATED });
    } catch (err) {
        responseErrorHandle( res, 500, errorMessages.SOMETHING_WENT_WRONG );
    }
};

export const deleteSchedule = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await Schedule.findByIdAndDelete(id);
        const data = { message: successMessages.SCHEDULE_SUCCESSFULLY_DELETED };
        responseSuccessHandle(res, 200, data);
    } catch (err) {
        responseErrorHandle( res, 500, errorMessages.SOMETHING_WENT_WRONG );
    }
};
