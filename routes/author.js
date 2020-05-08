const express = require('express');
const router = express.Router();

const passport = require('passport');

const authorController = require('../controllers/author');

router.get('/authors', authorController.getAuthors);

module.exports = router;
