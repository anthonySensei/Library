import passport from 'passport';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';

import User from '../schemas/user';
import { UserSchema } from '../models/user';

import logger from '../config/logger';

import { responseSuccessHandle, responseErrorHandle } from '../helper/response';
import { sendMail } from '../helper/email';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';
import { emailSubjects, generateUserActivationMessage } from '../constants/email';

const expiresIn = 3600 * 12;

config();

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
            const userJWT = { id: user._id, email: user.email };
            const token = jwt.sign(userJWT, secretKey, { expiresIn });
            const { _id, name, email, image, admin, librarian, phone } = user;
            const userData = { _id, name, email, image, admin, librarian, phone };
            jwt.verify(token, secretKey);
            const data = {
                message: successMessages.SUCCESSFULLY_LOGGED_IN,
                user: userData,
                token: 'Bearer ' + token,
                tokenExpiresIn: expiresIn
            };
            return responseSuccessHandle(res, 200, data);
        });
    })(req, res, next);
};

export const logout = (req: Request, res: Response) => {
    req.logout();
    return responseSuccessHandle(res, 200,  { message: successMessages.SUCCESSFULLY_LOGGED_OUT });
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
        await sendMail(email, emailSubjects.ACCOUNT_ACTIVATION, generateUserActivationMessage(activationToken));
        responseSuccessHandle(res, 200, { message: successMessages.USER_SUCCESSFULLY_CREATED });
    } catch (err) {
        logger.error(`Error creating user: ${err.message}`);
        responseSuccessHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
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
        return responseSuccessHandle(res, 200, { message: successMessages.SUCCESSFULLY_ACTIVATED });
    } catch (err) {
        console.error('Cannot activate user', err.message);
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};
