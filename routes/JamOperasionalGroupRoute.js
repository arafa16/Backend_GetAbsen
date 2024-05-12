import express from 'express';
import { createJamOperasionalGroups, deleteJamOperasionalGroups, getJamOperasionalGroups, getJamOperasionalGroupsById, getJamOperasionalGroupsTable, updateJamOperasionalGroups } from '../controllers/JamOperasionalGroup.js';

const router = express.Router();

router.get('/jamOperasionalGroups/table/:limit&:page', getJamOperasionalGroupsTable);
router.get('/jamOperasionalGroups/:id', getJamOperasionalGroupsById);
router.get('/jamOperasionalGroups', getJamOperasionalGroups);
router.post('/jamOperasionalGroups', createJamOperasionalGroups);
router.patch('/jamOperasionalGroups/:id', updateJamOperasionalGroups);
router.delete('/jamOperasionalGroups/:id', deleteJamOperasionalGroups);

export default router;