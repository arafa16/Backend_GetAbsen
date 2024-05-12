import express from 'express';
import {
    getStatus,
    getStatusById,
    createStatus,
    updateStatus,
    deleteStatus,
    getStatusTable
} from '../controllers/Status.js'

const router = express.Router();

router.get('/status/:limit&:page', getStatusTable);
router.get('/status/:id', getStatusById);
router.get('/status', getStatus);
router.post('/status', createStatus);
router.patch('/status/:id', updateStatus);
router.delete('/status/:id', deleteStatus);

export default router;