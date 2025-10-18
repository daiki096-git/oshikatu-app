import express,{Response} from 'express'

const router=express.Router();

router.get('/',(_req,res: Response)=>{
    res.render('chart')
})

export default router