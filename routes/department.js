const express = require('express');
const router = express.Router();

const passport = require('passport');

const departmentController = require('../controllers/department');

router.get('', departmentController.getDepartments);

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    departmentController.addDepartment
);
router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    departmentController.editDepartment
);
router.delete(
    '',
    passport.authenticate('jwt', { session: false }),
    departmentController.deleteDepartment
);

module.exports = router;
