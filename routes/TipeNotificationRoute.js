import express from 'express';
import { 
    createTipeNotification, 
    deleteTipeNotification, 
    getTipeNotification, 
    getTipeNotificationById, 
    getTipeNotificationTable, 
    updateTipeNotification 
} from '../controllers/TipeNotification.js';

const router = express.Router();

router.get('/tipeNotifications/:limit&:page', getTipeNotificationTable);
router.get('/tipeNotifications/:id', getTipeNotificationById);
router.get('/tipeNotifications', getTipeNotification);
router.post('/tipeNotifications', createTipeNotification);
router.patch('/tipeNotifications/:id', updateTipeNotification);
router.delete('/tipeNotifications/:id', deleteTipeNotification);

export default router;