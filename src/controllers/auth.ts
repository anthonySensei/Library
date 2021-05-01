import passport from 'passport';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

import User from '../schemas/user';
import { UserSchema } from '../models/user';

import logger from '../config/logger';

import { responseHandle, responseErrorHandle } from '../helper/responseHandle';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';
import { convertToBase64 } from '../helper/image';

const expiresIn = 3600 * 12;

require('dotenv').config();

export const login = (req: Request, res: Response, next: any) => {
    passport.authenticate('local', async (err: any, user: UserSchema) => {
        if (err) {
            return responseErrorHandle(res, 401, err);
        }

        if (!user) {
            return responseErrorHandle(res, 401, errorMessages.WRONG_PASSWORD_OR_EMAIL);
        }

        req.login(user, { session: false }, (loginErr: any) => {
            if (loginErr) {
                logger.error(`Login error: ${loginErr.message}`);
                return responseErrorHandle(res, 401, loginErr);
            }

            const secretKey = process.env.SECRET_KEY as string;
            const userJWT = { id: user.id, email: user.email };
            const token = jwt.sign(userJWT, secretKey, { expiresIn });
            const { _id: id, name, email, image, admin, librarian } = user;
            const userData = { id, name, email, image: convertToBase64(image), admin, librarian };
            jwt.verify(token, secretKey);
            const data = {
                success: true,
                message: successMessages.SUCCESSFULLY_LOGGED_IN,
                user: userData,
                token: 'Bearer ' + token,
                tokenExpiresIn: expiresIn
            };
            return responseHandle(res, 200, data);
        });
    })(req, res, next);
};

export const logout = (req: Request, res: Response) => {
    req.logout();
    const data = {
        success: true,
        message: successMessages.SUCCESSFULLY_LOGGED_OUT
    };
    return responseHandle(res, 200, data);
};

export const createUser = async (req: Request, res: Response) => {
    const { email, name, password, phone } = req.body;

    if (!email || !password || !name || !phone) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    try {
        const isUserExist = !!(await User.findOne({ email }));

        if (isUserExist) {
            return responseErrorHandle(res, 400, errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE);
        }

        const isUserWithEmailExists = !!(await User.findOne({ email }));

        if (isUserWithEmailExists) {
            return responseErrorHandle(res, 400, errorMessages.USER_EMAIL_EXISTS);
        }

        const activationToken = uuidv4();
        await User.create({ name, password, phone, email, activationToken });
        logger.info(`User ${email} has been successfully created`);
        responseHandle(res, 200, { success: true, message: successMessages.USER_SUCCESSFULLY_CREATED });
    } catch (err) {
        logger.error(`Error creating user: ${err.message}`);
        responseHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const checkActivationToken = async (req: Request, res: Response) => {
    const { activationToken } = req.body;

    if (!activationToken) {
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }

    try {
        const user = await User.findOne({ activationToken }) as UserSchema;

        if (!user) {
            return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
        }

        user.active = true;
        user.activationToken = '';
        await user.save();
        const data = { success: true, message: successMessages.SUCCESSFULLY_ACTIVATED };
        return responseHandle(res, 200, data);
    } catch (err) {
        console.error('Cannot activate user', err.message);
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};
