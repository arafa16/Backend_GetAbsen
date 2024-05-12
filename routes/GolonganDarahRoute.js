import express from 'express';
import { 
    createGolonganDarah, 
    deleteGolonganDarah,
    getGolonganDarahById, 
    getGolonganDarahs, 
    getGolonganDarahsTable, 
    updateGolonganDarah
} from '../controllers/GolonganDarah.js';

const router = express.Router();

router.get('/golonganDarahs/:limit&:page', getGolonganDarahsTable);
router.get('/golonganDarahs/:id', getGolonganDarahById);
router.get('/golonganDarahs', getGolonganDarahs);
router.post('/golonganDarahs', createGolonganDarah);
router.patch('/golonganDarahs/:id', updateGolonganDarah);
router.delete('/golonganDarahs/:id', deleteGolonganDarah);

export default router;