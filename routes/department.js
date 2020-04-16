const express = require('express');
const router = express.Router();

const passport = require('passport');

const departmentController = require('../controllers/department');

router.get(
    '/departments',
    passport.authenticate('jwt', { session: false }),
    departmentController.getDepartmentsForSelect
);

module.exports = router;
