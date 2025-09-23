import express from 'express'
import memoryRoutes from './memoryRoute'
import top from './top'

const router=express.Router();

router.use('/',top)
router.use('/api/memory',memoryRoutes)

export default router