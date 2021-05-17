import express from 'express';
import passport from 'passport';

import { getLoans, loanBook, returnBook } from '../controllers/loan';
import { getBookStatistic, getLibrarianStatistic, getSummaryStatistic, getUserStatistic, } from '../controllers/loan';

import { LOANS_URL } from '../constants/links';

const router = express.Router();
const { statisticUserUrl, statisticLibrarianUrl, statisticBookUrl, summaryStatisticUrl } = LOANS_URL;

router.get('', passport.authenticate('jwt', { session: false }), getLoans);
router.get(statisticUserUrl, passport.authenticate('jwt', { session: false }), getUserStatistic);
router.get(statisticLibrarianUrl, passport.authenticate('jwt', { session: false }), getLibrarianStatistic);
router.get(statisticBookUrl, passport.authenticate('jwt', { session: false }), getBookStatistic);
router.get(summaryStatisticUrl, passport.authenticate('jwt', { session: false }), getSummaryStatistic);
router.patch('/:id', passport.authenticate('jwt', { session: false }), returnBook);
router.post('', passport.authenticate('jwt', { session: false }), loanBook);

export default router;
