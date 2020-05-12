const express = require('express');
const router = express.Router();

const passport = require('passport');

const departmentController = require('../controllers/department');

router.get('', departmentController.getDepartments);

module.exports = router;
