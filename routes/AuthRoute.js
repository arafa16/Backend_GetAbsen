import express from 'express';
import { Login, Logout, getMe, register } from '../controllers/Auth.js';

const router = express.Router();

router.get('/me', getMe);
router.post('/login', Login);
router.post('/register', register);
router.delete('/logout', Logout);

export default router