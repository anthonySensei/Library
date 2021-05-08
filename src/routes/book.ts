const express = require('express');
const router = express.Router();

const passport = require('passport');

const bookController = require('../controllers/book');

const booksDetailsUrl = require('../constants/links').BOOKS_DETAILS_URL;
const booksMoveUrl = require('../constants/links').BOOKS_MOVE_URL;

router.get('', bookController.getBooks);

router.get(booksDetailsUrl, bookController.getBook);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    bookController.addBook
);

router.post(
    booksMoveUrl,
    passport.authenticate('jwt', { session: false }),
    bookController.moveBook
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
