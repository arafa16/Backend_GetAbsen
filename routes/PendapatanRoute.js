import express from 'express';
import { 
    createPendapatan, 
    deletePendapatan, 
    exportPendapatans, 
    getPendapatan, 
    getPendapatanById, 
    getPendapatanByUser, 
    getPendapatanTable,
    getPendapatanTableSearch,
    getPendapatanTableSearchById,
    getPendapatanTableById,
    importPendapatans,
    updatePendapatan 
} from '../controllers/Pendapatan.js';


const route = express.Router();

route.get('/pendapatans/:limit&:page&:userId', getPendapatanByUser);
route.get('/pendapatans/:limit&:page&:search/table', getPendapatanTableSearch);
route.get('/pendapatans/:limit&:page/table', getPendapatanTable);
route.get('/pendapatans/:id&:type&:limit&:page&:search/tableById', getPendapatanTableSearchById);
route.get('/pendapatans/:id&:type&:limit&:page/tableById', getPendapatanTableById);
route.get('/pendapatans/:id', getPendapatanById);
route.get('/pendapatans', getPendapatan);
route.post('/pendapatans', createPendapatan);
route.patch('/pendapatans/:id', updatePendapatan);
route.delete('/pendapatans/:id', deletePendapatan);

route.post('/pendapatans/import', importPendapatans);
route.get('/pendapatans/export', exportPendapatans);

export default route;