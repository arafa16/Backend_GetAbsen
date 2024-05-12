import express from 'express';
import {
    getGroupsTable,
    getGroupById,
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup 
} from '../controllers/Group.js';
const router = express.Router();

router.get('/groups/:limit&:page', getGroupsTable);
router.get('/groups/:id', getGroupById);
router.get('/groups', getGroups);
router.post('/groups', createGroup);
router.patch('/groups/:id', updateGroup);
router.delete('/groups/:id', deleteGroup);

export default router