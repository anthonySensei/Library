import express from 'express';
import passport from 'passport';

import { getLibrarian, getLibrarians } from '../controllers/librarian';

const router = express.Router();

router.get('', passport.authenticate('jwt', { session: false }), getLibrarians);
router.get('/:id', passport.authenticate('jwt', { session: false }), getLibrarian);

export default router;
