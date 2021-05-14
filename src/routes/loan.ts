import express from 'express';
import passport from 'passport';

import { getLoans, loanBook, returnBook } from '../controllers/loan';

const router = express.Router();

const loanController = require('../controllers/loan');

const loansStatisticUrl = require('../constants/links').LOANS_STATISTIC_URL;

router.get('', passport.authenticate('jwt', { session: false }), getLoans);

router.patch('/:id', passport.authenticate('jwt', { session: false }), returnBook);

router.post('', passport.authenticate('jwt', { session: false }), loanBook);

router.get(
    loansStatisticUrl,
    passport.authenticate('jwt', { session: false }),
    loanController.getLoansStatistic
);

module.exports = router;
