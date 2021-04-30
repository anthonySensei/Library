import express from 'express';
import passport from 'passport';

import { getStudents, getStudent } from '../controllers/student';

const router = express.Router();

router.get('', passport.authenticate('jwt', { session: false }), getStudents);
router.get('/:id', passport.authenticate('jwt', { session: false }), getStudent);

module.exports = router;
