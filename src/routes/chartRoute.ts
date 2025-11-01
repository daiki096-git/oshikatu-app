import express from 'express';
import { fetchChartController } from '../controllers/chartController';

const router=express.Router();

router.get('/',fetchChartController);

export default router