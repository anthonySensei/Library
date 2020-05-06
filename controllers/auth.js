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

const helper = require('../helper/responseHandle');

const base64Img = require('base64-img');

const sessionDuration = 3600 * 12;

const lengthOfGeneratedPassword = 8;
const charsetOfGeneratedPassword =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

exports.postLoginUser = (req, res, next) => {
    passport.authenticate('local', function (err, user) {
        if (err) {
            const data = {
                created: false,
                message: err
            };
            return helper.responseHandle(res, 401, data);
        }
        if (!user) {
            const data = {
                created: false,
                message: errorMessages.WRONG_PASSWORD_OR_EMAIL
            };
            return helper.responseHandle(res, 401, data);
        } else {
            let profileImage;
            if (!user.role) {
                Role.findOne({ where: { user_id: user.id } })
                    .then(role => {
                        profileImage = handleProfileImage(user.profile_image);
                        handleAuth(
                            profileImage,
                            req,
                            user,
                            res,
                            role.dataValues.role
                        );
                    })
                    .catch(err => {
                        const data = {
                            created: false,
                            message: errorMessages.SOMETHING_WENT_WRONG
                        };
                        return helper.responseHandle(res, 401, data);
                    });
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
            loggedIn: true,
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
            loggedOut: true,
            message: successMessages.SUCCESSFULLY_LOGGED_OUT
        }
    };
    return helper.responseHandle(res, 200, data);
};

exports.postCreateUser = (req, res, next) => {
    let creatingStudentByLibrarian = false;
    let email = req.body.email;
    let readerTicket = req.body.readerTicket;
    let userRole = req.body.userRole;

    let password;
    if (req.body.password) {
        password = req.body.password;
    } else {
        password = generatePassword();
        creatingStudentByLibrarian = true;
    }
    if (!email || !password || readerTicket) {
        const data = {
            created: false,
            message: errorMessages.EMPTY_FIELDS
        };
        return helper.responseHandle(res, 400, data);
    }

    Student.count({ where: { reader_ticket: readerTicket.toString() } })
        .then(rCount => {
            if (rCount > 0) {
                return helper.responseErrorHandle(
                    res,
                    400,
                    errorMessages.READER_TICKET_ALREADY_IN_USE
                );
            } else {
                Librarian.count({ where: { email: email } })
                    .then(count => {
                        if (count > 0) {
                            return helper.responseErrorHandle(
                                res,
                                400,
                                errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
                            );
                        } else {
                            Student.count({ where: { email: email } })
                                .then(sCount => {
                                    if (sCount > 0) {
                                        return helper.responseErrorHandle(
                                            res,
                                            400,
                                            errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
                                        );
                                    } else {
                                        let status = userStatus.NEW;
                                        const registrationToken = uuidv4();

                                        bcrypt.genSalt(10, (err, salt) => {
                                            bcrypt.hash(
                                                password,
                                                salt,
                                                (err, hash) => {
                                                    if (
                                                        creatingStudentByLibrarian
                                                    ) {
                                                        status =
                                                            userStatus.ACTIVATED;
                                                        createStudentByManager(
                                                            userRole,
                                                            email,
                                                            readerTicket,
                                                            password,
                                                            status,
                                                            hash,
                                                            res
                                                        );
                                                    } else {
                                                        createStudent(
                                                            userRole,
                                                            email,
                                                            readerTicket,
                                                            registrationToken,
                                                            password,
                                                            hash,
                                                            status,
                                                            res
                                                        );
                                                    }
                                                }
                                            );
                                        });
                                    }
                                })
                                .catch(err =>
                                    helper.responseHandle(
                                        res,
                                        400,
                                        errorMessages.SOMETHING_WENT_WRONG
                                    )
                                );
                        }
                    })
                    .catch(err =>
                        helper.responseHandle(
                            res,
                            400,
                            errorMessages.SOMETHING_WENT_WRONG
                        )
                    );
            }
        })
        .catch(err =>
            helper.responseHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG)
        );
};

const createStudentByManager = (
    userRole,
    email,
    readerTicket,
    registrationToken,
    password,
    status,
    hash,
    res
) => {
    createStudent(
        userRole,
        email,
        readerTicket,
        null,
        password,
        hash,
        status,
        res
    );
};

const createStudent = (
    userRole,
    email,
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

    newStudent
        .save()
        .then(user => {
            const data = {
                created: true,
                message: successMessages.ACCOUNT_SUCCESSFULLY_CREATED
            };
            return helper.responseHandle(res, 200, data);
        })
        .catch(err => {
            const data = {
                created: false,
                message: errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE
            };
            return helper.responseHandle(res, 500, data);
        });
};

exports.postCheckRegistrationToken = (req, res, next) => {
    const token = req.body.registrationToken;

    if (!token) {
        const data = {
            isActivated: false,
            message: errorMessages.SOMETHING_WENT_WRONG
        };
        return helper.responseHandle(res, 400, data);
    }

    Student.findOne({ where: { registration_token: token } })
        .then(user => {
            user.update({
                status: userStatus.ACTIVATED,
                registration_token: ''
            })
                .then(result => {
                    const data = {
                        isActivated: true,
                        message: successMessages.SUCCESSFULLY_ACTIVATED
                    };
                    return helper.responseHandle(res, 200, data);
                })
                .catch(err => {
                    const data = {
                        isActivated: false,
                        message: errorMessages.SOMETHING_WENT_WRONG
                    };
                    return helper.responseHandle(res, 400, data);
                });
        })
        .catch(err => {
            const data = {
                isActivated: false,
                message: errorMessages.SOMETHING_WENT_WRONG
            };
            return helper.responseHandle(res, 400, data);
        });
};

function generatePassword() {
    let charset = charsetOfGeneratedPassword,
        retVal = '';
    for (let i = 0, n = charset.length; i < lengthOfGeneratedPassword; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
