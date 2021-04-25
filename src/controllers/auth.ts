import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken'

import User from '../schemas/user';

import logger from '../config/logger';

import { responseHandle, responseErrorHandle } from '../helper/responseHandle';

import errorMessages from '../constants/errorMessages';
import successMessages from '../constants/successMessages';
import { UserModel } from '../models/user';

const Student = require('../schemas/student');
const Role = require('../schemas/role');

const passport = require('passport');

const userStatus = require('../constants/userStatuses');
const roles = require('../constants/roles');

const checkUniqueness = require('../helper/checkUniqueness');
const generatePassword = require('../helper/generatePassword');
const imageHandle = require('../helper/imageHandle');

const studentController = require('./student');

const expiresIn = 3600 * 12;

require('dotenv').config();

exports.login = (req: Request, res: Response, next) => {
    passport.authenticate('local', async (err, user: UserModel) => {
        if (err) {
            return responseErrorHandle(res, 401, err);
        }

        if (!user) {
            return responseErrorHandle(res,401,errorMessages.WRONG_PASSWORD_OR_EMAIL);
        }

        req.login(user, { session: false }, err => {
            if (err) {
                logger.error(`Login error: ${err.message}`);
                return responseErrorHandle(res, 401, err);
            }

            const secretKey = process.env.SECRET_KEY;
            const userJWT = { id: user.id, email: user.email };
            const token = jwt.sign(userJWT, secretKey, { expiresIn });
            const { _id: id, name, email, image, admin, librarian } = user;
            const userData = { id, name, email, image, admin, librarian };
            jwt.verify(token, secretKey);
            const data = {
                success: true,
                message: successMessages.SUCCESSFULLY_LOGGED_IN,
                user: userData,
                token: 'Bearer ' + token,
                tokenExpiresIn: expiresIn
            };
            return responseHandle(res, 200, data);
        })
    })(req, res, next);
};

exports.getLogout = (req, res) => {
    req.logout();
    const data = {
        isSuccessful: true,
        message: successMessages.SUCCESSFULLY_LOGGED_OUT
    };
    return responseHandle(res, 200, data);
};

exports.createUser = async (req: Request, res: Response) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    if (!email || !password || !name) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    try {
        const isUserExist = !!(await User.findOne({ email }));

        if (isUserExist) {
            return responseErrorHandle(res, 400, errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE)
        }

        const activationToken = uuidv4();
        await User.create({ name, password, email, activationToken });
        logger.info(`User ${email} has been successfully created`);
        responseHandle(res, 200, { success: true, message: successMessages.USER_SUCCESSFULLY_CREATED });
    } catch (err) {
        logger.error(`Error creating user: ${err.message}`);
        responseHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.postCheckRegistrationToken = async (req, res, next) => {
    const token = req.body.registrationToken;

    if (!token) return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);

    try {
        const student = await Student.findOne({ where: { registration_token: token }});
        await student.update({ status: userStatus.ACTIVATED, registration_token: '' });
        const data = { isSuccessful: true, message: successMessages.SUCCESSFULLY_ACTIVATED };
        return responseHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};
