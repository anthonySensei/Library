import express from 'express';
import passport from 'passport';

const router = express.Router();

const studentController = require('../controllers/student');

const studentStudentUrl = require('../constants/links').STUDENTS_STUDENT_URL;
router.get(
    '',
    passport.authenticate('jwt', { session: false }),
    studentController.getStudents
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
