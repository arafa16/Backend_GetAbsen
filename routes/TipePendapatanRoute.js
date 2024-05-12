import express from 'express';
import { 
    createTipePendapatan, 
    deleteTipePendapatan, 
    getTipePendapatan, 
    getTipePendapatanById, 
    getTipePendapatanTable, 
    updateTipePendapatan 
} from '../controllers/TipePendapatan.js';

const router = express.Router();

router.get('/tipePendapatans/:limit&:page', getTipePendapatanTable);
router.get('/tipePendapatans/:id', getTipePendapatanById);
router.get('/tipePendapatans', getTipePendapatan);
router.post('/tipePendapatans', createTipePendapatan);
router.patch('/tipePendapatans/:id', updateTipePendapatan);
router.delete('/tipePendapatans/:id', deleteTipePendapatan);

export default router;