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
router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    genreController.editGenre
);
router.delete(
    '',
    passport.authenticate('jwt', { session: false }),
    genreController.deleteGenre
);

module.exports = router;
