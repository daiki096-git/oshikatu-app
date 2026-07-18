import express from 'express';
import { fetchChartController, fetchYearlyChartController } from '../controllers/chartController';

const router=express.Router();

router.get('/',fetchChartController);
router.get('/yearly',fetchYearlyChartController);

export default router