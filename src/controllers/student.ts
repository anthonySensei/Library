import { Request, Response } from 'express';

import User from '../schemas/user';

import { UserSchema } from '../models/user';

import logger from '../config/logger';

import { responseSuccessHandle, responseErrorHandle } from '../helper/response';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

export const getStudents = async (req: Request, res: Response) => {
    const { pageNumber: page, pageSize, sortOrder, filterValue, sortName } = req.query;
    const regex = new RegExp(filterValue as string, 'i');
    const sort: any = {};
    sort[sortName as string] = sortOrder;
    const filterCondition = {
        admin: false,
        librarian: false,
        $and: [ { $or: [{name: regex }, { email: regex }, { phone: regex }] } ]
    };

    try {
        const quantity = await User.countDocuments(filterCondition);
        const studentsDb = await User.find(filterCondition, {}, {
            limit: Number(pageSize),
            skip: (Number(page) - 1) * Number(pageSize),
            sort
        }) as UserSchema[];

        const students = studentsDb.map(student => ({
            ...student.toJSON(),
            password: null,
        }));
        const data = { students, quantity, message: successMessages.SUCCESSFULLY_FETCHED };
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error('Error fetching users', err.message);
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const getStudent = async (req: Request, res: Response) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId) as UserSchema;
        const studentData = { ...student.toJSON(), password: null };

        return responseSuccessHandle(res, 200, { message: successMessages.SUCCESSFULLY_FETCHED, student: studentData });
    } catch (err) {
        logger.error('Cannot fetch student', err.message);
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};
