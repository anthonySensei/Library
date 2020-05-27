const express = require('express');
const router = express.Router();

const passport = require('passport');

const loanController = require('../controllers/loan');

const loansStatisticUrl = require('../constants/links').LOANS_STATISTIC_URL;

router.get(
    '',
    passport.authenticate('jwt', { session: false }),
    loanController.getAllLoans
);

router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    loanController.returnBook
);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    loanController.loanBook
);

router.get(
    loansStatisticUrl,
    passport.authenticate('jwt', { session: false }),
    loanController.getLoansStatistic
);

module.exports = router;
