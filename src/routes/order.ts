import express from 'express';
import passport from 'passport';

import { getOrders } from '../controllers/order';

const router = express.Router();

const orderController = require('../controllers/order');

router.get('', passport.authenticate('jwt', { session: false }), getOrders);

router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    orderController.loanBookFromOrder
);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    orderController.orderBook
);

module.exports = router;
