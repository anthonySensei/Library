const express = require('express');
const router = express.Router();

const passport = require('passport');

const orderController = require('../controllers/order');

router.get(
    '',
    passport.authenticate('jwt', { session: false }),
    orderController.getAllOrders
);

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
