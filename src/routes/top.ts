import express,{Response} from 'express'
import { renderChartController } from '../controllers/chartController'
import { COST_CATEGORIES } from '../config/costCategories'

const router=express.Router();

router.get('/',(_req,res: Response)=>{
    res.render('home',{currentPage:'home'})
})

router.get('/record',(_req,res: Response)=>{
    res.render('index',{currentPage:'record', costCategories: COST_CATEGORIES})
})
router.get('/chart',renderChartController)
router.get('/setting',(_req,res: Response)=>{
    res.render('setting',{currentPage:'setting'})
})

export default router
