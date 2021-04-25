const express = require('express');

const router = express.Router();

const librarianController = require('../controllers/librarian');

const passport = require('passport');

const librarianUrl = require('../constants/links').LIBRARIANS_LIBRARIAN_URL;
const librarianAllUrl = require('../constants/links').LIBRARIANS_ALL_URL;

router.get(
    '',
    passport.authenticate('jwt', { session: false }),
    librarianController.getLibrarians
);
router.get(
    librarianAllUrl,
    passport.authenticate('jwt', { session: false }),
    librarianController.getAllLibrarians
);

router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    librarianController.editLibrarian
);

router.delete(
    '',
    passport.authenticate('jwt', { session: false }),
    librarianController.deleteLibrarian
);

router.get(
    librarianUrl,
    passport.authenticate('jwt', { session: false }),
    librarianController.getLibrarian
);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    librarianController.addLibrarian
);

module.exports = router;
