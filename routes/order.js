const express = require('express');
const router = express.Router();

const passport = require('passport');

const orderController = require('../controllers/order');

router.get(
    '/orders',
    passport.authenticate('jwt', { session: false }),
    orderController.getAllOrders
);

router.post(
    '/orders',
    passport.authenticate('jwt', { session: false }),
    orderController.orderBook
);

module.exports = router;
