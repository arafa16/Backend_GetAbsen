import express from 'express';
import { getAtasans } from '../controllers/Atasan.js';

const router = express.Router();

router.get('/atasans', getAtasans);

export default router;