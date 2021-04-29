import express from 'express';
import passport from 'passport';

import { deleteUser, editUser, createUser } from '../controllers/user';

const router = express.Router();

const userController = require('../controllers/user');

router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    userController.postUpdateUserData
);

router.post('', passport.authenticate('jwt', { session: false }), createUser);
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteUser);
router.put('/:id', passport.authenticate('jwt', { session: false }), editUser);

module.exports = router;
