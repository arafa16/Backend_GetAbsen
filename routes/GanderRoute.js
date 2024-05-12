import express from 'express';
import {
    createGander,
    getGanders, 
    getGandersTable,
    getGanderById,
    deleteGander,
    updateGander
} from '../controllers/Gander.js';
const router = express.Router();

router.get('/ganders/:limit&:page', getGandersTable);
router.get('/ganders/:id', getGanderById);
router.get('/ganders', getGanders);
router.post('/ganders', createGander);
router.patch('/ganders/:id', updateGander);
router.delete('/ganders/:id', deleteGander);

export default router