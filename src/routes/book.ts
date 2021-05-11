import passport from 'passport';
import express from 'express';

const router = express.Router();

const bookController = require('../controllers/book');

const booksDetailsUrl = require('../constants/links').BOOKS_DETAILS_URL;

router.get('', bookController.getBooks);

router.get(booksDetailsUrl, bookController.getBook);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    bookController.addBook
);

router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    bookController.editBook
);

router.delete(
    '',
    passport.authenticate('jwt', { session: false }),
    bookController.deleteBook
);

module.exports = router;
