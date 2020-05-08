const express = require('express');
const router = express.Router();

const passport = require('passport');

const genreController = require('../controllers/genres');

router.get('/genres', genreController.getGenres);

module.exports = router;
