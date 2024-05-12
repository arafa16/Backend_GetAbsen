import express from 'express';
import { 
    createPeriode, 
    deletePeriode, 
    getPeriode, 
    getPeriodeById, 
    getPeriodeTable, 
    getPeriodeTableStatus, 
    updatePeriode 
} from '../controllers/PeriodeKerja.js';

const route = express.Router();

route.get('/periode/:limit&:page&:isActive', getPeriodeTableStatus);
route.get('/periode/:limit&:page', getPeriodeTable);
route.get('/periode/:id', getPeriodeById);
route.get('/periode', getPeriode);
route.post('/periode', createPeriode);
route.patch('/periode/:id', updatePeriode);
route.delete('/periode/:id', deletePeriode);

export default route;