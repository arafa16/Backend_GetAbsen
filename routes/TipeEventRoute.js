import express from 'express';
import { createTipeEvents, deleteTipeEvents, getTipeEvents, getTipeEventsById, getTipeEventsTable, updateTipeEvents } from '../controllers/TipeEvent.js';

const router = express.Router();

router.get('/tipeEvents/:id', getTipeEventsById);
router.get('/tipeEvents', getTipeEvents);
router.get('/tipeEvents/table/:limit&:page', getTipeEventsTable);
router.post('/tipeEvents', createTipeEvents);
router.patch('/tipeEvents/:id', updateTipeEvents);
router.delete('/tipeEvents/:id', deleteTipeEvents);

export default router;