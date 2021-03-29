const Student = require('../models/student');
const Role = require('../models/role');

const jwt = require('jsonwebtoken');
const secret_key = require('../config/secret_key');

const uuidv4 = require('uuid/v4');

const passport = require('passport');

const userStatus = require('../constants/userStatuses');
const errorMessages = require('../constants/errorMessages');
const successMessages = require('../constants/successMessages');
const roles = require('../constants/roles');

const helper = require('../helper/responseHandle');
const checkUniqueness = require('../helper/checkUniqueness');
const generatePassword = require('../helper/generatePassword');
const imageHandle = require('../helper/imageHandle');

const studentController = require('./student');

const expiresIn = 3600 * 12;

exports.postLoginUser = (req, res, next) => {
    passport.authenticate('local', async (err, user) => {
        if (err) return helper.responseErrorHandle(res, 401, err);
        
        if (!user) {
            return helper.responseErrorHandle(res,401,errorMessages.WRONG_PASSWORD_OR_EMAIL);
        } else {
            let profileImage;

            if (!user.role) {

                try {
                    const role = await Role.findOne({ where: { librarian_id: user.id }});
                    profileImage = imageHandle.convertToBase64( user.profile_image);
                    handleAuth(profileImage, req, user, res, role.get().role);
                } catch (err) {
                    return helper.responseErrorHandle(res,401,errorMessages.SOMETHING_WENT_WRONG);
                }

            } else {
                profileImage = imageHandle.convertToBase64(user.profile_image);
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
        if (err) return helper.responseErrorHandle(res, 401, err);
        
        const userJWT = { id: user.id, email: user.email, role };
        const token = jwt.sign(userJWT, secret_key, { expiresIn });
        jwt.verify(token, secret_key);
        const data = {
            isSuccessful: true,
            message: successMessages.SUCCESSFULLY_LOGGED_IN,
            user: userData,
            token: 'Bearer ' + token,
            tokenExpiresIn: expiresIn
        };
        return helper.responseHandle(res, 200, data);
    });
};

exports.getLogout = (req, res) => {
    req.logout();
    const data = {
        isSuccessful: true,
        message: successMessages.SUCCESSFULLY_LOGGED_OUT
    };
    return helper.responseHandle(res, 200, data);
};

exports.postCreateUser = async (req, res, next) => {
    const email = req.body.email;
    const readerTicket = req.body.readerTicket.toString();
    const name = req.body.name;
    const userRole = roles.STUDENT;
    const password = req.body.password;

    if (!email || !password || !readerTicket || !name || !password)
        return helper.responseErrorHandle(res, 400, errorMessages.EMPTY_FIELDS);

    try {
        const isNotUniqueReaderTicket = await checkUniqueness.checkReaderTicket(readerTicket);
        if (isNotUniqueReaderTicket) {
            return helper.responseErrorHandle(res, 400, errorMessages.READER_TICKET_ALREADY_IN_USE);
        } else {
            const isNotUniqueEmail = await checkUniqueness.checkEmail(email);

            if (isNotUniqueEmail) {
                return helper.responseErrorHandle(res, 400, errorMessages.EMAIL_ADDRESS_ALREADY_IN_USE);
            } else {
                const status = userStatus.NEW;
                const registrationToken = uuidv4();
                await studentController.createStudent(
                    userRole,
                    email,
                    name,
                    readerTicket,
                    registrationToken,
                    generatePassword.cryptPassword(password),
                    status,
                    res
                );
            }
        }
    } catch (err) {
        helper.responseHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};

exports.postCheckRegistrationToken = async (req, res, next) => {
    const token = req.body.registrationToken;

    if (!token) return helper.responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);

    try {
        const student = await Student.findOne({ where: { registration_token: token }});
        await student.update({ status: userStatus.ACTIVATED, registration_token: '' });
        const data = { isSuccessful: true, message: successMessages.SUCCESSFULLY_ACTIVATED };
        return helper.responseHandle(res, 200, data);
    } catch (err) {
        return helper.responseErrorHandle(res, 400, errorMessages.SOMETHING_WENT_WRONG);
    }
};
