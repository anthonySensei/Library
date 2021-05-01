import { Request, Response } from 'express';

import User from '../schemas/user';

import { UserModel, UserSchema } from '../models/user';

import logger from '../config/logger';
import { mongoDBClient } from '../index';

import { responseHandle, responseErrorHandle } from '../helper/responseHandle';
import { convertToBase64 } from '../helper/image';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';

export const getStudents = async (req: Request, res: Response) => {
    const { pageNumber: page, pageSize, sortOrder, filterValue, sortName } = req.query;
    const regex = new RegExp(filterValue as string, 'i');
    const filterCondition = {
        admin: false,
        librarian: false,
        $and: [ { $or: [{name: regex }, { email: regex }, { phone: regex }] } ]
    };

    try {
        const studentQuantity = await User.countDocuments(filterCondition);
        const sort: any = {};
        sort[sortName as string] = sortOrder === 'desc' ? -1 : 1;
        const query = { admin: false, librarian: false, $and: [ { $or: [{name: regex }, { email: regex }, { phone: regex }] } ] };
        const options =  { limit: Number(pageSize),  skip: (Number(page) - 1) * Number(pageSize), sort };
        const studentsDb = await mongoDBClient.db('Library').collection('users').find(query, options).toArray();

        const students: UserModel[] = studentsDb.map(student => ({
            id: student._id,
            name: student.name,
            email: student.email,
            image: convertToBase64(student.image),
            phone: student.phone,
            active: student.active
        }));
        const data = {
            students,
            message: successMessages.SUCCESSFULLY_FETCHED,
            quantity: studentQuantity,
            success: true
        };
        return responseHandle(res, 200, data);
    } catch (err) {
        logger.error('Error fetching users', err.message);
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const getStudent = async (req: Request, res: Response) => {
    const studentId = req.params.id;

    try {
        const student = await User.findById(studentId) as UserSchema;
        const studentData = {
            name: student.name,
            email: student.email,
            phone: student.phone,
            image: student.image,
            active: student.active,
            loans: [],
            statistic: [],
            orders: []
        };
        const data = {
            success: true,
            message: successMessages.SUCCESSFULLY_FETCHED,
            student: studentData
        };
        return responseHandle(res, 200, data);
    } catch (err) {
        logger.error('Cannot fetch student', err.message);
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};
