import express from 'express';
import { fetchChartController, fetchYearlyChartController, fetchMonthlyChartController } from '../controllers/chartController';

const router=express.Router();

router.get('/',fetchChartController);
router.get('/yearly',fetchYearlyChartController);
router.get('/monthly',fetchMonthlyChartController);

export default router