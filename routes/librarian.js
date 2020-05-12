const express = require('express');

const router = express.Router();

const librarianController = require('../controllers/librarian');

const passport = require('passport');

const librarianUrl = require('../constants/links').LIBRARIANS_LIBRARIAN_URL;

router.get(
    '',
    passport.authenticate('jwt', { session: false }),
    librarianController.getLibrarians
);

router.get(
    librarianUrl,
    passport.authenticate('jwt', { session: false }),
    librarianController.getLibrarian
);

module.exports = router;
