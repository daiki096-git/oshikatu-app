import express,{Response} from 'express'

const router=express.Router();

router.get('/',(_req,res: Response)=>{
    res.render('home',{currentPage:'home'})
})

router.get('/record',(_req,res: Response)=>{
    res.render('index',{currentPage:'record'})
})
router.get('/chart',(_req,res: Response)=>{
    res.render('chart',{currentPage:'chart'})
})
router.get('/setting',(_req,res: Response)=>{
    res.render('setting',{currentPage:'setting'})
})

export default router
