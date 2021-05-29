import express from 'express';
import passport from 'passport';

import {addSchedule, deleteSchedule, editSchedule, getSchedules} from '../controllers/schedule';

const router = express.Router();

router.get('', passport.authenticate('jwt', { session: false }), getSchedules);
router.post('', passport.authenticate('jwt', { session: false }), addSchedule);
router.put('/:id', passport.authenticate('jwt', { session: false }), editSchedule);
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteSchedule);

export default router;
