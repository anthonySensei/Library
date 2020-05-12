const express = require('express');
const router = express.Router();

const passport = require('passport');

const authorController = require('../controllers/author');

router.get('', authorController.getAuthors);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    authorController.addAuthor
);

module.exports = router;
