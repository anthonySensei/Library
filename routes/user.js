const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');

const passport = require('passport');

const myAccountUpdateProfileImageUrl = require('../constants/links')
    .MY_ACCOUNT_UPDATE_PROGILE_IMAGE_URL;

router.get(
    '',
    passport.authenticate('jwt', { session: false }),
    userController.getUser
);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    userController.postUpdateUserData
);

router.post(
    myAccountUpdateProfileImageUrl,
    passport.authenticate('jwt', { session: false }),
    userController.postUpdateProfileImage
);

module.exports = router;
