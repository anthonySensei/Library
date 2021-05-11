import express from 'express';
import passport from 'passport';

import { addALanguage, deleteLanguage, editLanguage, getLanguages } from '../controllers/language';

const router = express.Router();

router.get('', getLanguages);
router.post('', passport.authenticate('jwt', { session: false }), addALanguage);
router.put('/:id', passport.authenticate('jwt', { session: false }), editLanguage);
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteLanguage);

export default router;
