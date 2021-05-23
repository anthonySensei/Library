import express from 'express';
import passport from 'passport';

import { getSchedules } from '../controllers/schedule';

const router = express.Router();

router.get('', passport.authenticate('jwt', { session: false }), getSchedules);

module.exports = router;
