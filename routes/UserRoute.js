import express from 'express';
import {
    createUser,
    deleteUser,
    getUserById, 
    getUsers, 
    getUsersTable,
    changePassword,
    updateUser,
    importUsers,
    exportUsers,
    exportUsersByStatus
} from '../controllers/Users.js';
import { uploadPhoto } from '../controllers/PhotoProfile.js';

const router = express.Router();

router.get('/users/:limit&:page&:statusCode', getUsersTable);
router.get('/users/:id', getUserById);
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/password', changePassword);
router.patch('/users/:id/photo', uploadPhoto);
router.delete('/users/:id', deleteUser);
router.post('/users/import', importUsers);
router.get('/usersExport/:status', exportUsersByStatus);
router.get('/usersExport', exportUsers);

export default router;