const express = require('express');
const router = express.Router();

const passport = require('passport');

const bookController = require('../controllers/book');

const booksDetailsUrl = require('../constants/links').BOOKS_DETAILS_URL;

router.get('', bookController.getAllBooks);

router.get(booksDetailsUrl, bookController.getBook);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    bookController.addBook
);

module.exports = router;
