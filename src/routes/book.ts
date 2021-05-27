import passport from 'passport';
import express from 'express';

import {addBook, deleteBook, editBook, getBook, getBooks, getBookStats} from '../controllers/book';

const router = express.Router();

router.get('', getBooks);
router.get('/:id', getBook);
router.get('/:id/stats', getBookStats);
router.post('', passport.authenticate('jwt', { session: false }), addBook);
router.put('/:id', passport.authenticate('jwt', { session: false }), editBook);
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteBook);

export default router;
