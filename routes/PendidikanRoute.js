import express from 'express';
import { 
    createPendidikan, 
    deletePendidikan, 
    getPendidikanById, 
    getPendidikans, 
    getPendidikansTable, 
    updatePendidikan 
} from '../controllers/Pendidikan.js';

const router = express.Router();

router.get('/pendidikans/:limit&:page', getPendidikansTable);
router.get('/pendidikans/:id', getPendidikanById);
router.get('/pendidikans', getPendidikans);
router.post('/pendidikans', createPendidikan);
router.patch('/pendidikans/:id', updatePendidikan);
router.delete('/pendidikans/:id', deletePendidikan);

export default router;