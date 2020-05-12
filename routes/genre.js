const express = require('express');
const router = express.Router();

const passport = require('passport');

const genreController = require('../controllers/genre');

router.get('', genreController.getGenres);
router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    genreController.addGenre
);

module.exports = router;
