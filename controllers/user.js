const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const Student = require('../models/student');
const Librarian = require('../models/librarian');

const bcrypt = require('bcryptjs');

const uuidv4 = require('uuid/v4');

const base64Img = require('base64-img');

const helper = require('../helper/responseHandle');

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
        const checkEmail = !!(await dbTable.findOne({
            where: { email: user.email, id: { [Op.ne]: user.id } }
        }));
        if (checkEmail) {
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
    } catch (error) {
        const data = {
            isSuccessful: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 400, data);
    }
};

const updatePassword = async (res, dbTable, userId, passwordObj) => {
    if (
        !passwordObj.oldPassword ||
        !passwordObj.newPassword ||
        !passwordObj.retypeNewPassword
    ) {
        const data = {
            changedUserInfo: false,
            message: errorMessages.EMPTY_FIELDS
        };
        return helper.responseHandle(res, 400, data);
    }
    try {
        const user = await dbTable.findOne({ where: { id: userId } });
        const userData = user.get();
        if (bcrypt.compareSync(passwordObj.oldPassword, userData.password)) {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(
                    passwordObj.newPassword,
                    salt,
                    async (err, hash) => {
                        passwordObj.newPassword = hash;
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
                                message:
                                    successMessages.PASSWORD_SUCCESSFULLY_CHANGED
                            };
                            return helper.responseHandle(res, 200, data);
                        } else {
                            const data = {
                                isSuccessful: false,
                                message:
                                    errorMessages.OLD_PASSWORD_EQUEL_NEW_PASSWORD
                            };
                            return helper.responseHandle(res, 400, data);
                        }
                    }
                );
            });
        } else {
            const data = {
                isSuccessful: false,
                message: errorMessages.WRONG_OLD_PASSWORD
            };
            return helper.responseHandle(res, 400, data);
        }
    } catch (error) {
        const data = {
            isSuccessful: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 400, data);
    }
};

const updateImage = async (res, dbTable, user) => {
    if (!user.profileImage) {
        const data = {
            isSuccessful: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 400, data);
    }
    const profileImagePath = base64Img.imgSync(
        user.profileImage,
        '../images/profile',
        uuidv4()
    );
    try {
        const userInDb = await dbTable.findOne({ where: { id: user.id } });
        await userInDb.update({ profile_image: profileImagePath });
        const data = {
            isSuccessful: true,
            message: successMessages.PROFILE_IMAGE_SUCCESSFULLY_CHANGED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        const data = {
            isSuccessful: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 400, data);
    }
};
