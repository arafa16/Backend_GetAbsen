import express from 'express';
import { 
    createPenempatan, 
    deletePenempatan, 
    getPenempatanById, 
    getPenempatans, 
    getPenempatansTable, 
    updatePenempatan 
} from '../controllers/Penempatan.js';

const router = express.Router();

router.get('/penempatans/:limit&:page', getPenempatansTable);
router.get('/penempatans/:id', getPenempatanById);
router.get('/penempatans', getPenempatans);
router.post('/penempatans', createPenempatan);
router.patch('/penempatans/:id', updatePenempatan);
router.delete('/penempatans/:id', deletePenempatan);

export default router;