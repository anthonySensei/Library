import express from 'express';
import passport from 'passport';
import { deleteUser } from '../controllers/user';

const router = express.Router();

const userController = require('../controllers/user');

router.put(
    '',
    passport.authenticate('jwt', { session: false }),
    userController.postUpdateUserData
);

router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteUser);

module.exports = router;
