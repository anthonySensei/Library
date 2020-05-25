const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Student = require('../models/student');
const Librarian = require('../models/librarian');

const bcrypt = require('bcryptjs');

const helper = require('../helper/responseHandle');
const imageHandler = require('../helper/imageHandle');
const passwordGenerator = require('../helper/generatePassword');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const changedProfileData = require('../constants/changedProfileData');
const userRoles = require('../constants/roles');

exports.postUpdateUserData = (req, res) => {
    const user = JSON.parse(req.body.user);
    const changedField = req.body.changedField;
    let dbTable;
    if (user.role.role === userRoles.STUDENT) dbTable = Student;
    else dbTable = Librarian;

    if (changedField === changedProfileData.INFO)
        updateInfo(res, dbTable, user);
    else if (changedField === changedProfileData.PASSWORD)
        updatePassword(res, dbTable, user.id, JSON.parse(req.body.passwordObj));
    else if (changedField === changedProfileData.IMAGE)
        updateImage(res, dbTable, user);
};

const updateInfo = async (res, dbTable, user) => {
    try {
        const userInDb = await dbTable.findOne({
            where: { id: user.id }
        });
        const isNotUniqueEmail = !!(await dbTable.findOne({
            where: { email: user.email, id: { [Op.ne]: user.id } }
        }));
        if (isNotUniqueEmail) {
            return helper.responseErrorHandle(
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
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

const updatePassword = async (res, dbTable, userId, passwordObj) => {
    if (
        !passwordObj.oldPassword ||
        !passwordObj.newPassword ||
        !passwordObj.retypeNewPassword
    ) {
        return helper.responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);
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
                return helper.responseHandle(res, 200, data);
            } else {
                return helper.responseErrorHandle(
                    res,
                    400,
                    errorMessages.OLD_PASSWORD_EQUEL_NEW_PASSWORD
                );
            }
        } else {
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.WRONG_OLD_PASSWORD
            );
        }
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};

const updateImage = async (res, dbTable, user) => {
    if (!user.profileImage) {
        return helper.responseErrorHandle(
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
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
};
