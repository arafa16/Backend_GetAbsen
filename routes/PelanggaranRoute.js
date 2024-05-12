import express from 'express';
import { createPelanggaran, deletePelanggaran, getPelanggaran, getPelanggaranById, getPelanggaranTable, updatePelanggaran } from '../controllers/Pelanggaran.js';

const router = express.Router();

router.get('/pelanggarans/:limit&:page', getPelanggaranTable);
router.get('/pelanggarans/:id', getPelanggaranById);
router.get('/pelanggarans', getPelanggaran);
router.post('/pelanggarans', createPelanggaran);
router.patch('/pelanggarans/:id', updatePelanggaran);
router.delete('/pelanggarans/:id', deletePelanggaran);

export default router;