import express from 'express';
import { 
    getDataByFinger,
    getDataFinger,
} from '../controllers/InOut.js';
import { getDataMesinAbsen } from '../controllers/InOutController.js';

const route = express.Router();

route.get('/inOutMesin', getDataFinger);
route.get('/inOutMesinByFinger', getDataByFinger);

route.get('/mesinAbsen/:ip/:day', getDataMesinAbsen);


export default route;