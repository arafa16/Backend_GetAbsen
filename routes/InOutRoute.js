import express from 'express';
import { 
    getDataByFinger,
    getDataFinger,
} from '../controllers/InOut.js';

const route = express.Router();

route.get('/inOutMesin', getDataFinger);
route.get('/inOutMesinByFinger', getDataByFinger);


export default route;