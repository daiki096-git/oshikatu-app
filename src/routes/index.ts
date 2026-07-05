import express from 'express'
import memoryRoutes from './memoryRoute'
import top from './top'
import chart from './chart'
import chartRoutes from './chartRoute'
import homeRoutes from './homeRoute'

const router=express.Router();

router.use('/',top)
router.use('/api/memory',memoryRoutes)
router.use('/api/home',homeRoutes)
router.use('/chart',chart)
router.use('/api/chart',chartRoutes)


export default router