import express from 'express';
import { 
    createMesinAbsen, 
    deleteMesinAbsen, 
    getDataMesinAbsen, 
    getMesinAbsen, 
    getMesinAbsenById, 
    getMesinAbsenTable, 
    updateMesinAbsen 
} from '../controllers/MesinAbsenController.js';

const route = express.Router();

route.get('/mesinAbsens', getMesinAbsen);
route.get('/mesinAbsens/:id', getMesinAbsenById);
route.get('/mesinAbsensRun', getDataMesinAbsen);
route.get('/mesinAbsens/table/:limit&:page&:status', getMesinAbsenTable);
route.post('/mesinAbsens', createMesinAbsen);
route.patch('/mesinAbsens/:id', updateMesinAbsen);
route.delete('/mesinAbsens/:id', deleteMesinAbsen);

export default route;