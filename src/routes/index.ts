import express from 'express'
import memoryRoutes from './memoryRoute'
import top from './top'
import chart from './chart'

const router=express.Router();

router.use('/',top)
router.use('/api/memory',memoryRoutes)
router.use('/chart',chart)

export default router