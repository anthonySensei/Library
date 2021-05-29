import { Request, Response } from 'express';

import User from '../schemas/user';

import { UserModel, UserSchema } from '../models/user';

import { responseErrorHandle, responseSuccessHandle } from '../helper/response';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';
import logger from '../config/logger';

export const getLibrarians = async (req: Request, res: Response) => {
    const { pageNumber: page, pageSize, sortOrder, filterValue, sortName } = req.query;
    const regex = new RegExp(filterValue as string, 'i');
    const sort: any = {};
    sort[sortName as string] = sortOrder;
    const filterCondition = {
        admin: false,
        librarian: true,
        $and: [ { $or: [{name: regex }, { email: regex }, { phone: regex }] } ]
    };

    try {
        const librariansQuantity = await User.countDocuments(filterCondition);
        const librariansDb = await User.find(filterCondition, {}, {
            limit: Number(pageSize),
            skip: (Number(page) - 1) * Number(pageSize),
            sort
        }) as UserSchema[];

        const librarians: UserModel[] = librariansDb.map(student => ({
            id: student._id,
            name: student.name,
            email: student.email,
            image: student.image,
            phone: student.phone,
            schedule: []
        }));

        const data = { librarians, message: successMessages.SUCCESSFULLY_FETCHED, quantity: librariansQuantity};
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error('Error getting librarians', err.message);
        return responseErrorHandle(res, 500, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const getLibrarian = async (req: Request, res: Response) => {
    const librarianId = req.params.id;

    try {
        const librarian = await User.findById(librarianId) as UserSchema;
        const librarianData = {
            ...librarian.toJSON(),
            password: null
        };
        const data = { message: successMessages.SUCCESSFULLY_FETCHED, librarian: librarianData};
        return responseSuccessHandle(res, 200, data);
    } catch (err) {
        logger.error('Error getting librarian', err.message);
        return responseErrorHandle(res, 400, err);
    }
};
