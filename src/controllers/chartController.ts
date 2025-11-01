import { Request, Response } from "express"
import { fetchChartModel } from "../models/chartModel";

export const fetchChartController = async (req: Request, res: Response) => {
    try {
        const year = req.query.year as string;
        const month = req.query.month as string;
        const data = await fetchChartModel(year, month);
        if(!data || data.length === 0 || data[0].category === null)return res.status(404).json({ message: "データが存在しません" });
        let total = 0;        
        for (let i = 0; i < data.length; i++) {
            total += data[i].count
        }
        for (let i = 0; i < data.length; i++) {
            data[i].count = Math.floor(data[i].count / total * 100)
        }
        console.log(data);
        res.status(200).json(data)
    } catch (error) {
        throw error;
    }

}