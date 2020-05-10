const express = require('express');
const router = express.Router();

const passport = require('passport');

const bookController = require('../controllers/book');

router.get('/books', bookController.getAllBooks);

router.get('/book-details', bookController.getBook);

router.post(
    '/books',
    passport.authenticate('jwt', { session: false }),
    bookController.addBook
);

module.exports = router;
