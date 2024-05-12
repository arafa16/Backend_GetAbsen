import express from 'express';
import { 
    createJabatan, 
    deleteJabatan, 
    getJabatanById, 
    getJabatans, 
    getJabatansTable, 
    updateJabatan 
} from '../controllers/Jabatan.js';

const router = express.Router();

router.get('/jabatans/:limit&:page',getJabatansTable);
router.get('/jabatans/:id',getJabatanById);
router.get('/jabatans',getJabatans);
router.post('/jabatans',createJabatan);
router.patch('/jabatans/:id',updateJabatan);
router.delete('/jabatans/:id',deleteJabatan);

export default router;