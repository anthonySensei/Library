const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

const registrationUrl = require('../constants/links').AUTH_REGISTRATION_URL;
const loginUrl = require('../constants/links').AUTH_LOGIN_URL;
const logoutUrl = require('../constants/links').AUTH_LOGOUT_URL;
const checkRegistrationTokenUrl = require('../constants/links')
    .AUTH_CHECK_REGISTRATION_TOKEN_URL;

router.post(registrationUrl, authController.createUser);

router.post(
    checkRegistrationTokenUrl,
    authController.postCheckRegistrationToken
);

router.post(loginUrl, authController.login);

router.get(logoutUrl, authController.getLogout);

module.exports = router;
