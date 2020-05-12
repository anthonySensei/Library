const express = require('express');

const router = express.Router();

const librarianController = require('../controllers/librarian');

const passport = require('passport');

router.get(
    '/librarians',
    passport.authenticate('jwt', { session: false }),
    librarianController.getLibrarians
);

router.get(
    '/librarians/librarian',
    passport.authenticate('jwt', { session: false }),
    librarianController.getLibrarian
);

module.exports = router;
