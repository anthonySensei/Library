const express = require('express');
const router = express.Router();

const passport = require('passport');

const loanController = require('../controllers/loan');

const loansStatisticUrl = require('../constants/links').LOANS_STATISTIC_URL;
const loansStatisticTopUrl = require('../constants/links')
    .LOANS_STATISTIC_TOP_URL;

router.get(
    '',
    passport.authenticate('jwt', { session: false }),
    loanController.getAllLoans
);

router.get(
    loansStatisticUrl,
    passport.authenticate('jwt', { session: false }),
    loanController.getLoansStatistic
);

router.get(
    loansStatisticUrl + loansStatisticTopUrl,
    passport.authenticate('jwt', { session: false }),
    loanController.getTopFive
);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    loanController.loanBook
);

module.exports = router;
