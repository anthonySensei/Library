import express from 'express';
import passport from 'passport';

import { deleteUser, editUser, createUser, getUser, editPassword, editImage } from '../controllers/user';

const router = express.Router();

router.get('', passport.authenticate('jwt', { session: false }), getUser);
router.post('', passport.authenticate('jwt', { session: false }), createUser);
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteUser);
router.put('/:id', passport.authenticate('jwt', { session: false }), editUser);
router.post('/:id', passport.authenticate('jwt', { session: false }), editPassword);
router.patch('/:id', passport.authenticate('jwt', { session: false }), editImage);

module.exports = router;
