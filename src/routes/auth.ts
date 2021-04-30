import express from 'express';

import { createUser, login, logout, checkActivationToken } from '../controllers/auth';

import { authUrls } from '../constants/links';

const router = express.Router();
const { CHECK_ACTIVATION_TOKEN_URL, REGISTRATION_URL, LOGIN_URL, LOGOUT_URL } = authUrls;

router.post(REGISTRATION_URL, createUser);
router.post(CHECK_ACTIVATION_TOKEN_URL, checkActivationToken);
router.post(LOGIN_URL, login);
router.get(LOGOUT_URL, logout);

module.exports = router;
