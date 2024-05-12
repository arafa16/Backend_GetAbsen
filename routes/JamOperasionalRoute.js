import express from 'express';
import { 
    createJamOperasional, 
    deleteJamOperasional, 
    getJamOperasionalById, 
    getJamOperasionals, 
    getJamOperasionalsTable, 
    updateJamOperasional 
} from '../controllers/JamOperasional.js';

const router = express.Router();

router.get('/jamOperasionals/:limit&:page', getJamOperasionalsTable);
router.get('/jamOperasionals/:id', getJamOperasionalById);
router.get('/jamOperasionals', getJamOperasionals);
router.post('/jamOperasionals', createJamOperasional);
router.patch('/jamOperasionals/:id', updateJamOperasional);
router.delete('/jamOperasionals/:id', deleteJamOperasional);

export default router;