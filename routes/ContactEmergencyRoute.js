import express from 'express';
import { 
    createKontak, 
    deleteKontak, 
    getKontakById, 
    getKontaks, 
    getKontaksTable, 
    updateKontak 
} from '../controllers/ContactEmergency.js';

const router = express.Router();

router.get('/contacts/:limit&:page', getKontaksTable);
router.get('/contacts/:id', getKontakById);
router.get('/contacts', getKontaks);
router.post('/contacts', createKontak);
router.patch('/contacts/:id', updateKontak);
router.delete('/contacts/:id', deleteKontak);

export default router;