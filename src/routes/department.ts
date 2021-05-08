import express from 'express';
import passport from 'passport';

import { createDepartment, deleteDepartment, editDepartment, getDepartments } from '../controllers/department';

const router = express.Router();

router.get('', getDepartments);
router.post('', passport.authenticate('jwt', { session: false }), createDepartment);
router.put('/:id', passport.authenticate('jwt', { session: false }), editDepartment);
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteDepartment);

export default router;
