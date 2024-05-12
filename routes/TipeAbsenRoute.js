import express from 'express';
import { 
    createTipeAbsen, 
    deleteTipeAbsen, 
    getTipeAbsen, 
    getTipeAbsenById, 
    getTipeAbsenTable, 
    updateTipeAbsen 
} from '../controllers/TipeAbsen.js';

const router = express.Router();

router.get('/tipeAbsens/:limit&:page', getTipeAbsenTable);
router.get('/tipeAbsens/:id', getTipeAbsenById);
router.get('/tipeAbsens', getTipeAbsen);
router.post('/tipeAbsens', createTipeAbsen);
router.patch('/tipeAbsens/:id', updateTipeAbsen);
router.delete('/tipeAbsens/:id', deleteTipeAbsen);

export default router;