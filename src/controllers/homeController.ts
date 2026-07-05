import {request,response} from 'express';
import {fetchHomeModel} from '../models/homeModel'

export const homeController=async(req:request,res:response)=>{
try{
    const date=new Date();
    const year=date.getFullYear();
    const month=date.getMonth()+1;
    const homeData=await fetchHomeModel(year,month);
    const nextEventTitle=homeData[1][0].title;
    const nextEventDate=homeData[1][0].date;
    let count=0;
    let cost=0;
    for(let i=0;i<homeData[0].length;i++){
        count+=homeData[0][i].count;
        cost+=parseInt(homeData[0][i].cost);
    }
    res.status(200).json({ count, cost, nextEventTitle, nextEventDate });
}catch(error){
    console.log(error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
}
}