const Student = require('../models/student');
const Role = require('../models/role');

const bcrypt = require('bcryptjs');

const uuidv4 = require('uuid/v4');

const base64Img = require('base64-img');

const helper = require('../helper/responseHandle');

const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');

exports.getUser = (req, res) => {
    const email = req.query.email;

    if (!email) {
        return helper.responseErrorHandle(
            res,
            400,
            errorMessages.INVALID_EMAIL
        );
    }

    Student.findOne({ where: { email: email } })
        .then(user => {
            Role.findOne({ where: { librarian_id: user.dataValues.id } })
                .then(role => {
                    if (user.dataValues.profile_image) {
                        user.dataValues.profile_image = base64Img.base64Sync(
                            user.dataValues.profile_image
                        );
                    } else {
                        user.dataValues.profile_image = '';
                    }
                    userData = {
                        id: user.dataValues.id,
                        name: user.dataValues.name,
                        email: user.dataValues.email,
                        profileImage: user.dataValues.profile_image,
                        role: role.dataValues
                    };
                    const data = {
                        message: successMessages.SUCCESSFULLY_FETCHED,
                        user: userData
                    };
                    return helper.responseHandle(res, 200, data);
                })
                .catch(err => {
                    return helper.responseErrorHandle(res, 400, err);
                });
        })
        .catch(err => {
            return helper.responseErrorHandle(res, 400, err);
        });
};

exports.postUpdateUserData = (req, res) => {
    const userId = req.body.user.id;
    const isChangePassword = req.body.changeData.changePassword;
    const oldPassword = req.body.passwordObject.oldPassword;
    const newPassword = req.body.passwordObject.newPassword;
    const retypeNewPassword = req.body.passwordObject.retypeNewPassword;
    const email = req.body.user.email;
    const name = req.body.user.name;

    if (!userId) {
        return helper.responseErrorHandle(
            res,
            400,
            errorMessages.SOMETHING_WENT_WRONG
        );
    }
    Student.findOne({ where: { user_id: userId } })
        .then(user => {
            if (isChangePassword) {
                changePasswordHandler(
                    res,
                    user,
                    oldPassword,
                    newPassword,
                    retypeNewPassword
                );
            } else if (req.body.changeData.changeInfo) {
                changeUserInfoHandler(email, name, user, res);
            }
        })
        .catch(err => {
            const data = {
                changedUserInfo: false,
                message: errorMessages.SOMETHING_WENT_WRONG
            };
            return helper.responseHandle(res, 400, data);
        });
};

const changePasswordHandler = (
    res,
    user,
    oldPassword,
    newPassword,
    retypeNewPassword
) => {
    if (!oldPassword) {
        const data = {
            changedUserInfo: false,
            message: errorMessages.EMPTY_FIELDS
        };
        return helper.responseHandle(res, 400, data);
    }
    if (bcrypt.compareSync(oldPassword, user.dataValues.password)) {
        if (!newPassword || !retypeNewPassword) {
            const data = {
                changedUserInfo: false,
                message: errorMessages.EMPTY_FIELDS
            };
            return helper.responseHandle(res, 400, data);
        }
        if (newPassword === retypeNewPassword) {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newPassword, salt, (err, hash) => {
                    newPassword = hash;
                    if (!bcrypt.compareSync(oldPassword, newPassword)) {
                        user.update({
                            password: newPassword
                        })
                            .then(result => {
                                const data = {
                                    passwordChanged: true,
                                    message:
                                        successMessages.PASSWORD_SUCCESSFULLY_CHANGED
                                };
                                return helper.responseHandle(res, 200, data);
                            })
                            .catch(err => {
                                const data = {
                                    passwordChanged: false,
                                    message:
                                        errorMessages.PASSWORD_ERROR_CHANGED
                                };
                                return helper.responseHandle(res, 400, data);
                            });
                    } else {
                        const data = {
                            passwordChanged: false,
                            message:
                                errorMessages.OLD_PASSWORD_EQUEL_NEW_PASSWORD
                        };
                        return helper.responseHandle(res, 400, data);
                    }
                });
            });
        } else {
            const data = {
                passwordChanged: false,
                message: errorMessages.DIFFERENT_PASSWORDS
            };
            return helper.responseHandle(res, 400, data);
        }
    } else {
        const data = {
            passwordChanged: false,
            message: errorMessages.WRONG_OLD_PASSWORD
        };
        return helper.responseHandle(res, 400, data);
    }
};

const changeUserInfoHandler = (email, name, user, res) => {
    if (!email || !name) {
        const data = {
            changedUserInfo: false,
            message: errorMessages.EMPTY_FIELDS
        };
        return helper.responseHandle(res, 400, data);
    }
    user.update({
        email: email,
        name: name
    })
        .then(result => {
            const data = {
                changedUserInfo: true,
                message: successMessages.INFO_SUCCESSFULLY_CHANGED
            };
            return helper.responseHandle(res, 200, data);
        })
        .catch(err => {
            const data = {
                changedUserInfo: false,
                message: errorMessages.SOMETHING_WENT_WRONG
            };
            return helper.responseHandle(res, 400, data);
        });
};

exports.postUpdateProfileImage = (req, res) => {
    const profileImageBase64 = req.body.base64;
    const user = JSON.parse(req.body.user);

    if (!profileImageBase64 || !user) {
        const data = {
            changedUserInfo: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 400, data);
    }

    const profileImagePath = base64Img.imgSync(
        profileImageBase64,
        '../images/profile',
        uuidv4()
    );

    Student.findOne({ where: { user_id: user.id } })
        .then(user => {
            user.update({
                profile_image: profileImagePath
            })
                .then(result => {
                    const data = {
                        created: true,
                        message:
                            successMessages.PROFILE_IMAGE_SUCCESSFULLY_CHANGED
                    };
                    return helper.responseHandle(res, 200, data);
                })
                .catch(err => {
                    const data = {
                        created: false,
                        message: errorMessages.SOMETHING_WENT_WRONG
                    };
                    return helper.responseHandle(res, 400, data);
                });
        })
        .catch(err => {
            const data = {
                created: false,
                message: errorMessages.SOMETHING_WENT_WRONG
            };
            return helper.responseHandle(res, 500, data);
        });
};
