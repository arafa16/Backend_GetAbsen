import express from 'express';
import { 
    createStatusInout,
    deleteStatusInout,
    getStatusInout, 
    getStatusInoutById, 
    getStatusInoutTable, 
    updateStatusInout 
} from '../controllers/StatusInout.js';

const router = express.Router();

router.get('/statusInout/:limit&:page', getStatusInoutTable);
router.get('/statusInout/:id', getStatusInoutById);
router.get('/statusInout', getStatusInout);
router.post('/statusInout', createStatusInout);
router.patch('/statusInout/:id', updateStatusInout);
router.delete('/statusInout/:id', deleteStatusInout);

export default router;