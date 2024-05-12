import express from 'express';
import { 
    createStatusKoreksi, 
    deleteStatusKoreksi, 
    getStatusKoreksi, 
    getStatusKoreksiById, 
    getStatusKoreksiTable, 
    updateStatusKoreksi 
} from '../controllers/StatusKoreksi.js';

const router = express.Router();

router.get('/statusKoreksi/:limit&:page', getStatusKoreksiTable);
router.get('/statusKoreksi/:id', getStatusKoreksiById);
router.get('/statusKoreksi', getStatusKoreksi);
router.post('/statusKoreksi', createStatusKoreksi);
router.patch('/statusKoreksi/:id', updateStatusKoreksi);
router.delete('/statusKoreksi/:id', deleteStatusKoreksi);

export default router;