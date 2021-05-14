import { Request, Response } from 'express';

import logger from '../config/logger';

import User from '../schemas/user';

import { UserSchema } from '../models/user';

import successMessages from '../constants/successMessages';
import errorMessages from '../constants/errorMessages';

import { responseErrorHandle, responseSuccessHandle } from '../helper/response';
import { generatePassword } from '../helper/password';
import { getImagePath, convertToBase64 } from '../helper/image';
import { sendMail } from '../helper/email';
import { emailSubjects, generateUserCreationMessage } from '../constants/email';

export const createUser = async (req: Request, res: Response) => {
    const { name, email, phone, admin, librarian } = req.body;
    const password = generatePassword();

    if (!name || !email || !phone) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    const isUserWithEmailExists = !!(await User.findOne({ email }));

    if (isUserWithEmailExists) {
        return responseErrorHandle(res, 400, errorMessages.USER_EMAIL_EXISTS);
    }

    const isUserWithPhoneExists = !!(await User.findOne({ phone }));

    if (isUserWithPhoneExists) {
        return responseErrorHandle(res, 400, errorMessages.USER_PHONE_EXISTS);
    }

    try {
        await User.create({ name, email, phone, password, admin: admin || false, librarian: librarian || false, active: true });
        await sendMail(email, emailSubjects.ACCOUNT_CREATED, generateUserCreationMessage(email, password));
        responseSuccessHandle(res, 200, { message: successMessages.USER_SUCCESSFULLY_CREATED });
    } catch (err) {
        logger.error('Error creating user', err.message);
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
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
        responseSuccessHandle(res, 200, { message: successMessages.USER_SUCCESSFULLY_UPDATED });
    } catch (err) {
        logger.error('Error updating user', err.message);
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const editPassword = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    try {
        const user = await User.findById(id) as UserSchema;

        if (!user) {
            return responseErrorHandle(res, 400, errorMessages.USER_DOES_NOT_EXIST);
        }

        if (!(await user.comparePassword(oldPassword))) {
            return responseErrorHandle(res, 400, errorMessages.WRONG_OLD_PASSWORD);
        }

        if (await user.comparePassword(newPassword)) {
            return responseErrorHandle(res, 400, errorMessages.OLD_PASSWORD_EQUEL_NEW_PASSWORD);
        }

        user.password = newPassword;
        await user.save();

        responseSuccessHandle(res, 200, { message: successMessages.PASSWORD_SUCCESSFULLY_UPDATED });
    } catch (err) {
        logger.error('Error updating user', err.message);
        return responseErrorHandle(res, 400, errorMessages.PASSWORD_ERROR_CHANGED);
    }
};

export const editImage = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { image } = JSON.parse(req.body.user);

    if (!image) {
        return responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
    }

    try {
        const user = await User.findById(id) as UserSchema;

        if (!user) {
            return responseErrorHandle(res, 400, errorMessages.USER_DOES_NOT_EXIST);
        }

        user.image = getImagePath(image);
        await user.save();

        responseSuccessHandle(res, 200, { message: successMessages.IMAGE_SUCCESSFULLY_UPDATED });
    } catch (err) {
        logger.error('Error updating user', err.message);
        return responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        await User.findByIdAndDelete(id);
        responseSuccessHandle(res, 200, { message: successMessages.USER_SUCCESSFULLY_DELETED });
    } catch (err) {
        logger.error('Error deleting user', err.message);
    }
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.query;

  try {
      const user = await User.findById(id) as UserSchema;
      const { _id, email, phone, image, admin, librarian, name } = user;

      if (!user) {
          return responseErrorHandle(res, 500, errorMessages.USER_DOES_NOT_EXIST);
      }

      const userData = { id: _id, name, email, image: convertToBase64(image), admin, librarian, phone };
      responseSuccessHandle(res, 200, { user: userData });
  } catch (err) {
      logger.error('Error fetching user', err.message);
      responseErrorHandle(res, 500, 'Cannot fetch user');
  }
};
