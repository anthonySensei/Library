import express from 'express';
import passport from 'passport';

import { getOrders, loanBookFromOrder, orderBook } from '../controllers/order';

const router = express.Router();

router.get('', passport.authenticate('jwt', { session: false }), getOrders);
router.put('/:id', passport.authenticate('jwt', { session: false }), loanBookFromOrder);
router.post('', passport.authenticate('jwt', { session: false }), orderBook);

export default router;
