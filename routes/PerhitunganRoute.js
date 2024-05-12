import express from 'express';
import {
    getPerhitunganByGroupPeriode,
    exportPerhitunganByGroupPeriode
} from '../controllers/Perhitungan.js';

const router = express.Router();

router.get('/perhitungan/:idGroup&:idPeriode', getPerhitunganByGroupPeriode);
router.get('/perhitungan/:idGroup&:idPeriode/export', exportPerhitunganByGroupPeriode);

export default router;