import express from 'express';
import { createPrivilege, deletePrivilege, getPrivilegeById, getPrivileges, getPrivilegesTable, updatePrivilege } from '../controllers/Privilege.js';

const router = express.Router();

router.get('/privileges/:limit&:page', getPrivilegesTable);
router.get('/privileges', getPrivileges);
router.get('/privileges/:id', getPrivilegeById);
router.post('/privileges', createPrivilege);
router.patch('/privileges/:id', updatePrivilege);
router.delete('/privileges/:id', deletePrivilege);

export default router;