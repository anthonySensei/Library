const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');

const passport = require('passport');

router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    userController.postUpdateUserData
);

module.exports = router;
