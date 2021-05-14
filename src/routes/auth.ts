import express from 'express';

import { createUser, login, logout, checkActivationToken } from '../controllers/auth';

import { AUTH_URLS } from '../constants/links';

const router = express.Router();
const { CHECK_ACTIVATION_TOKEN_URL, REGISTRATION_URL, LOGIN_URL, LOGOUT_URL } = AUTH_URLS;

router.post(REGISTRATION_URL, createUser);
router.post(CHECK_ACTIVATION_TOKEN_URL, checkActivationToken);
router.post(LOGIN_URL, login);
router.get(LOGOUT_URL, logout);

export default router;
