import express from 'express';
import { 
    createHistoryKoreksi, 
    deleteHistoryKoreksi, 
    getHistoryKoreksi, 
    getHistoryKoreksiById, 
    getHistoryKoreksiTable, 
    updateHistoryKoreksi 
} from '../controllers/HistoryKoreksi.js';

const router = express.Router();

router.get('/historyKoreksi/:limit&:page', getHistoryKoreksiTable);
router.get('/historyKoreksi/:id', getHistoryKoreksiById);
router.get('/historyKoreksi', getHistoryKoreksi);
router.post('/historyKoreksi', createHistoryKoreksi);
router.patch('/historyKoreksi/:id', updateHistoryKoreksi);
router.delete('/historyKoreksi/:id', deleteHistoryKoreksi);

export default router;