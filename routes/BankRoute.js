import express from 'express';
import { 
    createBank, 
    deleteBank, 
    getBankById, 
    getBanks, 
    getBanksTable, 
    updateBank 
} from '../controllers/Bank.js';

const router = express.Router();

router.get('/banks/:limit&:page', getBanksTable);
router.get('/banks/:id', getBankById);
router.get('/banks', getBanks);
router.post('/banks', createBank);
router.patch('/banks/:id', updateBank);
router.delete('/banks/:id', deleteBank);

export default router;