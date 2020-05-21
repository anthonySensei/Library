const express = require('express');
const router = express.Router();

const passport = require('passport');

const periodController = require('../controllers/period');

router.get('', periodController.getPeriods);
router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    periodController.addPeriod
);
router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    periodController.editPeriod
);
router.delete(
    '',
    passport.authenticate('jwt', { session: false }),
    periodController.deletePeriod
);

module.exports = router;
