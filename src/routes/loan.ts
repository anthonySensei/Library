import express from 'express';
import passport from 'passport';

import { getLoans, getSummaryStatistic, loanBook, returnBook } from '../controllers/loan';

import { LOANS_URL } from '../constants/links';

const router = express.Router();
const { statisticUrl, summaryStatisticUrl } = LOANS_URL;

const loanController = require('../controllers/loan');

router.get('', passport.authenticate('jwt', { session: false }), getLoans);
router.get(summaryStatisticUrl, passport.authenticate('jwt', { session: false }), getSummaryStatistic);

router.patch('/:id', passport.authenticate('jwt', { session: false }), returnBook);
router.post('', passport.authenticate('jwt', { session: false }), loanBook);

router.get(
    statisticUrl,
    passport.authenticate('jwt', { session: false }),
    loanController.getLoansStatistic
);

module.exports = router;
