import express from 'express';
import passport from 'passport';

import { getSchedules } from '../controllers/schedule';

const router = express.Router();

const scheduleController = require('../controllers/schedule');

router.get('', getSchedules);
router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    scheduleController.addSchedule
);
router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    scheduleController.editSchedule
);
router.delete(
    '',
    passport.authenticate('jwt', { session: false }),
    scheduleController.deleteSchedule
);

module.exports = router;
