const express = require('express');
const router = express.Router();

const passport = require('passport');

const loanController = require('../controllers/loan');

router.get(
    '/loans',
    passport.authenticate('jwt', { session: false }),
    loanController.getAllLoans
);

router.get(
    '/loans-statistic',
    passport.authenticate('jwt', { session: false }),
    loanController.getLoansStatistic
);

router.get(
    '/loans-top',
    passport.authenticate('jwt', { session: false }),
    loanController.getTopFive
);

router.post(
    '/loans',
    passport.authenticate('jwt', { session: false }),
    loanController.loanBook
);


module.exports = router;
