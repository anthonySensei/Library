const express = require('express');
const router = express.Router();

const passport = require('passport');

const bookController = require('../controllers/book');

const booksDetailsUrl = require('../constants/links').BOOKS_DETAILS_URL;
const booksISBNsUrl = require('../constants/links').BOOKS_ISBN_URL;
const booksMoveUrl = require('../constants/links').BOOKS_MOVE_URL;

router.get('', bookController.getBooks);

router.get(booksISBNsUrl, bookController.getAllBooksISBN);

router.get(booksDetailsUrl, bookController.getBook);

router.get('/grouping', bookController.grouping);
router.get('/count', bookController.count);
router.get('/condition', bookController.condition);
router.post('/change-name', bookController.changeName);
router.post('/new-genre', bookController.newGenre);
router.delete('/delete-genre', bookController.deleteGenre);


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
