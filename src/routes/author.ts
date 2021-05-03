import express from 'express';
import passport from 'passport';

import { addAuthor, editAuthor, getAuthors, deleteAuthor } from '../controllers/author';

const router = express.Router();

router.get('', getAuthors);
router.post('', passport.authenticate('jwt', { session: false }), addAuthor);
router.put('/:id', passport.authenticate('jwt', { session: false }), editAuthor);
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteAuthor);

module.exports = router;
