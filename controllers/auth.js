const Student = require('../models/student');
const Librarian = require('../models/librarian');
const Role = require('../models/role');

const jwt = require('jsonwebtoken');
const secret_key = require('../config/secret_key');

const uuidv4 = require('uuid/v4');

const bcrypt = require('bcryptjs');

const passport = require('passport');

const userStatus = require('../constants/userStatuses');
const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const roles = require('../constants/roles');

const helper = require('../helper/responseHandle');

const base64Img = require('base64-img');

const sessionDuration = 3600 * 12;

const lengthOfGeneratedPassword = 8;
const charsetOfGeneratedPassword =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

exports.postLoginUser = (req, res, next) => {
    passport.authenticate('local', async (err, user) => {
        if (err) {
            const data = {
                isSuccessful: false,
                message: err
            };
            return helper.responseHandle(res, 401, data);
        }
        if (!user) {
            const data = {
                isSuccessful: false,
                message: errorMessages.WRONG_PASSWORD_OR_EMAIL
            };
            return helper.responseHandle(res, 401, data);
        } else {
            let profileImage;
            if (!user.role) {
                try {
                    const role = await Role.findOne({
                        where: { librarian_id: user.id }
                    });
                    profileImage = handleProfileImage(user.profile_image);
                    handleAuth(
                        profileImage,
                        req,
                        user,
                        res,
                        role.dataValues.role
                    );
                } catch (error) {
                    const data = {
                        isSuccessful: false,
                        message: errorMessages.SOMETHING_WENT_WRONG
                    };
                    return helper.responseHandle(res, 401, data);
                }
            } else {
                profileImage = handleProfileImage(user.profile_image);
                handleAuth(profileImage, req, user, res, user.role);
            }
        }
    })(req, res, next);
};

const handleAuth = (profileImage, req, user, res, role) => {
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: profileImage,
        role: { role: role }
    };

    req.login(user, { session: false }, err => {
        if (err) {
            helper.responseErrorHandle(res, 401, err);
        }
        const userJWT = {
            id: user.id,
            email: user.email,
            role: role
        };
        const token = jwt.sign(userJWT, secret_key, {
            expiresIn: sessionDuration
        });
        jwt.verify(token, secret_key);
        const data = {
            isSuccessful: true,
            message: successMessages.SUCCESSFULLY_LOGGED_IN,
            user: userData,
            token: 'Bearer ' + token,
            tokenExpiresIn: sessionDuration
        };
        return helper.responseHandle(res, 200, data);
    });
};

const handleProfileImage = image => {
    return image ? base64Img.base64Sync(image) : '';
};

exports.getLogout = (req, res) => {
    req.logout();
    const data = {
        responseCod: 200,
        data: {
            isSuccessful: true,
            message: successMessages.SUCCESSFULLY_LOGGED_OUT
        }
    };
    return helper.responseHandle(res, 200, data);
};

exports.postCreateUser = async (req, res, next) => {
    let creatingStudentByLibrarian = false;
    const email = req.body.email;
    const readerTicket = req.body.readerTicket;
    const name = req.body.name;
    const userRole = roles.STUDENT;

    let password;
    if (req.body.password) {
        password = req.body.password;
    } else {
        password = generatePassword();
        creatingStudentByLibrarian = true;
    }
    if (!email || !password || !readerTicket || !name) {
        const data = {
            isSuccessful: false,
            message: errorMessages.EMPTY_FIELDS
        };
        return helper.responseHandle(res, 400, data);
    }
    try {
        const stCount = await Student.count({
            where: { reader_ticket: readerTicket.toString() }
        });
        if (stCount > 0) {
            return helper.responseErrorHandle(
                res,
                400,
                errorMessages.READER_TICKET_ALREADY_IN_USE
            );
        } else {
            const libCount = await Librarian.count({ where: { email: email } });

            if (libCount > 0) {
                return helper.responseErrorHandle(
                    res,
                    400,
                    errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
                );
            } else {
                const emStCount = Student.count({ where: { email: email } });

                if (emStCount > 0) {
                    return helper.responseErrorHandle(
                        res,
                        400,
                        errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
                    );
                } else {
                    let status = userStatus.NEW;
                    const registrationToken = uuidv4();

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (creatingStudentByLibrarian) {
                                status = userStatus.ACTIVATED;
                                createStudent(
                                    userRole,
                                    email,
                                    name,
                                    readerTicket,
                                    null,
                                    password,
                                    hash,
                                    status,
                                    res
                                );
                            } else {
                                createStudent(
                                    userRole,
                                    email,
                                    name,
                                    readerTicket,
                                    registrationToken,
                                    password,
                                    hash,
                                    status,
                                    res
                                );
                            }
                        });
                    });
                }
            }
        }
    } catch (error) {
        helper.responseHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};

const createStudent = async (
    userRole,
    email,
    name,
    readerTicket,
    registrationToken,
    password,
    hash,
    status,
    res
) => {
    let newStudent;
    if (registrationToken) {
        newStudent = new Student({
            email: email,
            name: name,
            reader_ticket: readerTicket,
            registration_token: registrationToken,
            status: status,
            password: password
        });
    } else {
        newStudent = new Student({
            email: email,
            reader_ticket: readerTicket,
            status: status,
            password: password
        });
    }
    newStudent.password = hash;

    try {
        await newStudent.save();
        const data = {
            isSuccessful: true,
            message: successMessages.ACCOUNT_SUCCESSFULLY_CREATED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        const data = {
            isSuccessful: false,
            message: errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
        };
        return helper.responseHandle(res, 500, data);
    }
};

exports.postCheckRegistrationToken = async (req, res, next) => {
    const token = req.body.registrationToken;

    if (!token) {
        const data = {
            isActivated: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 400, data);
    }

    try {
        const student = await Student.findOne({
            where: { registration_token: token }
        });
        await student.update({
            status: userStatus.ACTIVATED,
            registration_token: ''
        });
        const data = {
            isActivated: true,
            message: successMessages.SUCCESSFULLY_ACTIVATED
        };
        return helper.responseHandle(res, 200, data);
    } catch (error) {
        const data = {
            isActivated: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 400, data);
    }
};

function generatePassword() {
    let charset = charsetOfGeneratedPassword,
        retVal = '';
    for (let i = 0, n = charset.length; i < lengthOfGeneratedPassword; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
