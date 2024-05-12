import express from 'express';
import { 
    sendEmail,
    verifyToken,
    resetPassword
} from '../controllers/ResetPassword.js';


const router = express.Router();

router.post('/resetByEmail', sendEmail);
router.get('/verifyToken/:token', verifyToken);
router.post('/reset/:token', resetPassword);

export default router;