const express = require('express');
const router = express.Router();

const passport = require('passport');

const genreController = require('../controllers/genre');

router.get('/genres', genreController.getGenres);
router.post(
    '/genres',
    passport.authenticate('jwt', { session: false }),
    genreController.addGenre
);

module.exports = router;
