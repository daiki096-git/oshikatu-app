import { Request, Response } from "express"
import { fetchChartModel } from "../models/chartModel";

//集計・分析ページを描画し、プルダウンの初期選択用に現在の年月を渡す
export const renderChartController = (_req: Request, res: Response) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    res.render('chart', { currentPage: 'chart', currentYear, currentMonth });
}

export const fetchChartController = async (req: Request, res: Response) => {
    try {
        const year = req.query.year as string;
        const month = req.query.month as string;
        const data = await fetchChartModel(year, month);
        console.log(data)
        if(!data || data.length === 0 || data[0].category === null)return res.status(404).json({ message: "データが存在しません" });
        let total = 0;        
        let cost_total = 0;
        for (let i = 0; i < data.length; i++) {
            total += data[i].count
            let cost = 0;
            if(data[i].cost){
            cost = parseInt(data[i].cost)
            cost_total += cost || 0
            }
        }
        for (let i = 0; i < data.length; i++) {
            data[i].count = Math.floor(data[i].count / total * 100)
        }
        res.status(200).json({data:data,total:total,cost_total:cost_total})
    } catch (error) {
        throw error;
    }

}