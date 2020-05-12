const express = require('express');

const router = express.Router();

const studentController = require('../controllers/student');

const passport = require('passport');

router.get(
    '/students',
    passport.authenticate('jwt', { session: false }),
    studentController.getStudents
);

router.get(
    '/students/student',
    passport.authenticate('jwt', { session: false }),
    studentController.getStudent
);

module.exports = router;
