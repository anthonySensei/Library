import express from 'express';
import passport from 'passport';

import { getSchedules } from '../controllers/schedule';

const router = express.Router();

router.get('', passport.authenticate('jwt', { session: false }), getSchedules);

export default router;
