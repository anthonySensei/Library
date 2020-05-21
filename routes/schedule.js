const express = require('express');
const router = express.Router();

const passport = require('passport');

const scheduleController = require('../controllers/schedule');

const schedulesSortedUrl = require('../constants/links').SCHEDULES_SORTED_URL;

router.get('', scheduleController.getSchedules);
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
