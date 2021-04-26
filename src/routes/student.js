const express = require('express');

const router = express.Router();

const studentController = require('../controllers/student');

const studentStudentUrl = require('../constants/links').STUDENTS_STUDENT_URL;
const studentAllUrl = require('../constants/links').STUDENTS_ALL_URL;

const passport = require('passport');

router.get(
    '',
    passport.authenticate('jwt', { session: false }),
    studentController.getStudents
);

router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    studentController.editStudent
);

router.delete(
    '',
    passport.authenticate('jwt', { session: false }),
    studentController.deleteStudent
);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    studentController.addStudent
);

router.get(
    studentStudentUrl,
    passport.authenticate('jwt', { session: false }),
    studentController.getStudent
);

module.exports = router;
