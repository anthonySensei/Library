const express = require('express');

const router = express.Router();

const studentController = require('../controllers/student');

const studentStudentUrl = require('../constants/links').STUDENTS_STUDENT_URL;

const passport = require('passport');

router.get(
    '',
    passport.authenticate('jwt', { session: false }),
    studentController.getStudents
);

router.get(
    studentStudentUrl,
    passport.authenticate('jwt', { session: false }),
    studentController.getStudent
);

module.exports = router;
