import express from 'express';
import { createNotification, deleteNotification, getNotification, getNotificationById, getNotificationByUser, updateNotification } from '../controllers/Notification.js';

const route = express.Router();

route.get('/notification/users/:id', getNotificationByUser);
route.get('/notification/:id', getNotificationById);
route.get('/notification', getNotification);
route.post('/notification', createNotification);
route.patch('/notification/:id', updateNotification);
route.delete('/notification/:id', deleteNotification);

export default route;