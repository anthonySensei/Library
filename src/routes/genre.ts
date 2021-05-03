import express from 'express';
import passport from 'passport';

import { addGenre, deleteGenre, editGenre, getGenres } from '../controllers/genre';

const router = express.Router();

router.get('', getGenres);
router.post('', passport.authenticate('jwt', { session: false }), addGenre);
router.put('/:id', passport.authenticate('jwt', { session: false }), editGenre);
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteGenre);

export default router;
