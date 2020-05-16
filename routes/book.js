const express = require('express');
const router = express.Router();

const passport = require('passport');

const bookController = require('../controllers/book');

const booksDetailsUrl = require('../constants/links').BOOKS_DETAILS_URL;
const booksISBNsUrl = require('../constants/links').BOOKS_ISBN_URL;

router.get('', bookController.getBooks);

router.get(booksISBNsUrl, bookController.getAllBooksISBN);

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

module.exports = router;
