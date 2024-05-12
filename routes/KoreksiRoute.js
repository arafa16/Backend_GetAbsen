import express from 'express';
import { 
    createKoreksi, 
    deleteKoreksi, 
    getKoreksi, 
    getKoreksiById, 
    updateKoreksi,
    getKoreksiTableByUser,
    getKoreksiTableByApprover, 
    approveKoreksi,
    getKoreksiByApprover,
    getKoreksiByUser,
    createKoreksiByDate
} from '../controllers/Koreksi.js';

const route = express.Router();

route.get('/koreksis/:limit&:page&:id&:statusCode/approver', getKoreksiTableByApprover);
route.get('/koreksis/:limit&:page&:id&:statusCode', getKoreksiTableByUser);
route.get('/koreksis/:limit&:page', getKoreksi);
route.get('/koreksis/:id/approver', getKoreksiByApprover);
route.get('/koreksis/:id/user', getKoreksiByUser);
route.get('/koreksis/:id', getKoreksiById);
route.get('/koreksis', getKoreksi);
route.post('/koreksis', createKoreksi);
route.post('/koreksis/byDate', createKoreksiByDate);
route.patch('/koreksis/:id/approve', approveKoreksi);
route.patch('/koreksis/:id', updateKoreksi);
route.delete('/koreksis/:id', deleteKoreksi);

export default route;