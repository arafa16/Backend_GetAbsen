import express from 'express';
import { createStatus, deleteStatus, getStatusById, getStatuses, getStatusesTable, updateStatus } from '../controllers/StatusPerkawinan.js';

const router = express.Router();

router.get('/statusPerkawinans/:limit&:page', getStatusesTable);
router.get('/statusPerkawinans/:id', getStatusById);
router.get('/statusPerkawinans', getStatuses);
router.post('/statusPerkawinans', createStatus);
router.patch('/statusPerkawinans/:id', updateStatus);
router.delete('/statusPerkawinans/:id', deleteStatus);

export default router;