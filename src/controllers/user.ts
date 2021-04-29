import { Request, Response } from 'express';

import logger from '../config/logger';

import User from '../schemas/user';

import successMessages from '../constants/successMessages';

import { responseHandle, responseErrorHandle } from '../helper/responseHandle';

const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Student = require('../schemas/student');
const Librarian = require('../schemas/librarian');

const bcrypt = require('bcryptjs');
const imageHandler = require('../helper/imageHandle');
const passwordGenerator = require('../helper/generatePassword');

const errorMessages = require('../constants/errorMessages');
const changedProfileData = require('../constants/changedProfileData');
const userRoles = require('../constants/roles');

exports.postUpdateUserData = (req: Request, res: Response) => {
    const user = JSON.parse(req.body.user);
    const changedField = req.body.changedField;
    let dbTable;

    if (user.role.role === userRoles.STUDENT) {
        dbTable = Student;
    } else {
        dbTable = Librarian;
    }

    if (changedField === changedProfileData.INFO) {
        updateInfo(res, dbTable, user);
    } else if (changedField === changedProfileData.PASSWORD) {
        updatePassword(res, dbTable, user.id, JSON.parse(req.body.passwordObj));
    } else if (changedField === changedProfileData.IMAGE) {
        updateImage(res, dbTable, user);
    }
};

const updateInfo = async (res: Response, dbTable: any, user: any) => {
    try {
        const userInDb = await dbTable.findOne({
            where: { id: user.id }
        });
        const isNotUniqueEmail = !!(await dbTable.findOne({
            where: { email: user.email, id: { [Op.ne]: user.id } }
        }));
        if (isNotUniqueEmail) {
            return responseErrorHandle(
                res,
                400,
                errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
            );
        }
        await userInDb.update({ name: user.name, email: user.email });
        const data = {
            isSuccessful: true,
            message: successMessages.SUCCESSFULLY_INFO_UPDATED
        };
        return responseHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

const updatePassword = async (res: Response, dbTable: any, userId: string, passwordObj: any) => {
    if (
        !passwordObj.oldPassword ||
        !passwordObj.newPassword ||
        !passwordObj.retypeNewPassword
    ) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }
    try {
        const user = await dbTable.findOne({ where: { id: userId } });
        const userData = user.get();
        if (bcrypt.compareSync(passwordObj.oldPassword, userData.password)) {
            passwordObj.newPassword = passwordGenerator.cryptPassword(
                passwordObj.newPassword
            );
            if (
                !bcrypt.compareSync(
                    passwordObj.oldPassword,
                    passwordObj.newPassword
                )
            ) {
                await user.update({
                    password: passwordObj.newPassword
                });
                const data = {
                    isSuccessful: true,
                    message: successMessages.PASSWORD_SUCCESSFULLY_CHANGED
                };
                return responseHandle(res, 200, data);
            } else {
                return responseErrorHandle(
                    res,
                    400,
                    errorMessages.OLD_PASSWORD_EQUEL_NEW_PASSWORD
                );
            }
        } else {
            return responseErrorHandle(
                res,
                400,
                errorMessages.WRONG_OLD_PASSWORD
            );
        }
    } catch (err) {
        return responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

const updateImage = async (res: Response, dbTable: any, user: any) => {
    if (!user.profileImage) {
        return responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
    const profileImagePath = imageHandler.getPath(user.profileImage);
    try {
        const userInDb = await dbTable.findOne({ where: { id: user.id } });
        await userInDb.update({ profile_image: profileImagePath });
        const data = {
            isSuccessful: true,
            message: successMessages.PROFILE_IMAGE_SUCCESSFULLY_CHANGED
        };
        return responseHandle(res, 200, data);
    } catch (err) {
        return responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

export const editUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    try {
        await User.findByIdAndUpdate(id, { name, email, phone });
        responseHandle(res, 200, { success: true, message: successMessages.USER_SUCCESSFULLY_UPDATED });
    } catch (err) {
        logger.error('Error deleting user', err.message);
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        await User.findByIdAndDelete(id);
        responseHandle(res, 200, { success: true, message: successMessages.USER_SUCCESSFULLY_DELETED });
    } catch (err) {
        logger.error('Error deleting user', err.message);
    }
};
